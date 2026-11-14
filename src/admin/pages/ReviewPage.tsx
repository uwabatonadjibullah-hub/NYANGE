import { Check, Megaphone, MessageSquareWarning, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Dialog, Field, inputClass } from '../../components/ui';
import { loadContent } from '../../lib/content';
import { useRegistry } from '../../lib/registry';
import type { Gender, Person } from '../../lib/types';
import { approveWithPersons, deleteReviewItem, listReview, saveContent, setReviewStatus, type ReviewCollection, type ReviewItem } from '../api';
import { can } from '../auth';
import { describeError, formatDate, useLoad, useSession } from '../context';
import { PersonPicker } from '../PersonPicker';

const TITLES: Record<ReviewCollection, { title: string; intro: string }> = {
  submissions: { title: 'Children claims', intro: 'Suggestions from family members to add children under a person in the tree. Approving adds them to the public family tree.' },
  notifications: { title: 'Record Me notices', intro: 'New family members, bereavements and family news sent through Record Me.' },
  messages: { title: 'Messages', intro: 'Messages sent through the Contact page.' },
};

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-pending-soft text-pending',
  approved: 'bg-mint text-primary',
  acknowledged: 'bg-mint text-primary',
  declined: 'bg-danger-soft text-danger-strong',
  needs_info: 'bg-pending-soft text-pending',
  archived: 'bg-line text-ink',
};

const LABELS: Record<string, string> = {
  senderName: 'From', senderContact: 'Contact', contributorName: 'From', contributorContact: 'Contact', fullName: 'From', contact: 'Contact',
  type: 'Type', personName: 'Person', parentName: 'Parent in tree', branchId: 'Family section', fatherName: 'Father', motherName: 'Mother',
  generation: 'Generation', connection: 'Connection', subject: 'Subject', details: 'Details', message: 'Message', category: 'Category',
  relationship: 'Relationship', notes: 'Notes', receiptCode: 'Reference', language: 'Language', reviewNote: 'Review note',
};
const HIDDEN = new Set(['id', 'status', 'createdAt', 'reviewedAt', 'reviewedBy', 'consent', 'children', 'parentId', 'parentGeneration', 'createdPersonIds']);

function ContactLink({ value }: { value: string }) {
  const href = value.includes('@') ? `mailto:${value}` : `tel:${value.replace(/[^+\d]/g, '')}`;
  return <a href={href} className="text-primary underline">{value}</a>;
}

export default function ReviewPage({ kind }: { kind: ReviewCollection }) {
  const session = useSession();
  const { data, error, loading, reload } = useLoad(() => listReview(kind), [kind]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [actionError, setActionError] = useState<string | null>(null);
  const [approve, setApprove] = useState<ReviewItem | null>(null);
  const [decide, setDecide] = useState<{ item: ReviewItem; status: string } | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const items = (data ?? []).filter((i) => filter === 'all' || i.status === 'pending');

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      reload();
    } catch (e) {
      setActionError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  const publishAnnouncement = (item: ReviewItem) =>
    act(async () => {
      const content = await loadContent(true);
      const text = `${String(item.subject ?? '')}: ${String(item.details ?? '')}`.slice(0, 600);
      await saveContent(session, { ...content, announcement: { active: true, text: { en: text, sw: text, rw: text, fr: text } } });
      await setReviewStatus(session, kind, item, 'approved', 'Published as website announcement');
      await loadContent(true);
    });

  return (
    <div>
      <h1 className="font-serif text-3xl">{TITLES[kind].title}</h1>
      <p className="mt-1 max-w-3xl text-muted">{TITLES[kind].intro}</p>
      <div className="mt-4 flex gap-2">
        {(['pending', 'all'] as const).map((f) => (
          <Button key={f} variant={filter === f ? 'primary' : 'secondary'} onClick={() => setFilter(f)}>
            {f === 'pending' ? `Waiting (${(data ?? []).filter((i) => i.status === 'pending').length})` : `All (${data?.length ?? 0})`}
          </Button>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {error && <Alert tone="error">{error}</Alert>}
        {actionError && <Alert tone="error">{actionError}</Alert>}
        {loading && <p role="status" className="text-muted">Loading…</p>}
        {!loading && items.length === 0 && <p className="py-8 text-center text-muted">Nothing here.</p>}
      </div>

      <ul className="mt-4 space-y-4">
        {items.map((item) => {
          const children = (item.children as { fullName: string; gender?: string; birthYear?: string; otherParentName?: string; notes?: string }[] | undefined) ?? [];
          return (
            <li key={item.id} className="rounded-lg border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-0.5 text-sm font-semibold ${STATUS_STYLE[item.status] ?? 'bg-line'}`}>{item.status.replace('_', ' ')}</span>
                  {typeof item.type === 'string' && <span className="rounded-full border border-line px-3 py-0.5 text-sm">{item.type.replace('_', ' ')}</span>}
                </div>
                <span className="text-sm text-muted">{formatDate(item.createdAt)}</span>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {Object.entries(item)
                  .filter(([k, v]) => !HIDDEN.has(k) && typeof v === 'string' && v)
                  .map(([k, v]) => (
                    <div key={k} className={['details', 'message', 'connection', 'notes'].includes(k) ? 'sm:col-span-2' : ''}>
                      <dt className="text-sm text-muted">{LABELS[k] ?? k}</dt>
                      <dd className="whitespace-pre-line break-words">{/contact/i.test(k) ? <ContactLink value={String(v)} /> : String(v)}</dd>
                    </div>
                  ))}
              </dl>
              {children.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-muted">Proposed children</p>
                  <ul className="mt-1 list-disc pl-6">
                    {children.map((c, i) => (
                      <li key={i}>
                        <strong>{c.fullName}</strong>
                        {[c.gender && c.gender !== 'unknown' ? c.gender : '', c.birthYear ? `born ${c.birthYear}` : '', c.otherParentName ? `other parent: ${c.otherParentName}` : ''].filter(Boolean).map((s) => ` · ${s}`).join('')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {item.status === 'pending' || item.status === 'needs_info' ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {kind === 'submissions' && can.edit(session.role) && (
                    <Button onClick={() => setApprove(item)} disabled={busy}><Check className="h-4 w-4" aria-hidden /> Review & add to tree</Button>
                  )}
                  {kind === 'notifications' && item.type === 'new_member' && can.edit(session.role) && (
                    <Button onClick={() => setApprove(item)} disabled={busy}><UserPlus className="h-4 w-4" aria-hidden /> Add to family tree</Button>
                  )}
                  {kind === 'notifications' && item.type === 'announcement' && can.edit(session.role) && (
                    <Button onClick={() => publishAnnouncement(item)} disabled={busy}><Megaphone className="h-4 w-4" aria-hidden /> Publish as announcement</Button>
                  )}
                  {kind !== 'submissions' && (
                    <Button variant="secondary" disabled={busy} onClick={() => act(() => setReviewStatus(session, kind, item, 'acknowledged'))}>Mark as handled</Button>
                  )}
                  {kind === 'submissions' && (
                    <Button variant="secondary" disabled={busy} onClick={() => { setNote(''); setDecide({ item, status: 'needs_info' }); }}>
                      <MessageSquareWarning className="h-4 w-4" aria-hidden /> Needs more information
                    </Button>
                  )}
                  {kind !== 'messages' && (
                    <Button variant="secondary" disabled={busy} onClick={() => { setNote(''); setDecide({ item, status: 'declined' }); }}>
                      <X className="h-4 w-4" aria-hidden /> Decline
                    </Button>
                  )}
                  {kind === 'notifications' && item.type === 'bereavement' && can.edit(session.role) && (
                    <Link to="/admin/registry" className="inline-flex min-h-11 items-center px-2 text-primary underline">Update the person in the registry</Link>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span>Reviewed {formatDate(item.reviewedAt)}</span>
                  {kind !== 'submissions' && item.status !== 'archived' && (
                    <Button variant="ghost" disabled={busy} onClick={() => act(() => setReviewStatus(session, kind, item, 'archived'))}>Archive</Button>
                  )}
                </div>
              )}
              {can.manageAdmins(session.role) && (
                <Button
                  variant="ghost"
                  className="mt-2 text-danger"
                  disabled={busy}
                  onClick={() => window.confirm('Delete this item permanently? This cannot be undone.') && act(() => deleteReviewItem(session, kind, item))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete permanently
                </Button>
              )}
            </li>
          );
        })}
      </ul>

      <Dialog open={!!decide} onClose={() => setDecide(null)} title={decide?.status === 'declined' ? 'Decline' : 'Ask for more information'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!decide) return;
            const d = decide;
            setDecide(null);
            act(() => setReviewStatus(session, kind, d.item, d.status, note));
          }}
          className="space-y-4"
        >
          <Field label="Note for the family record (not sent to the person)" optionalText="optional">
            {(p) => <textarea {...p} rows={3} className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />}
          </Field>
          <p className="text-sm text-muted">Contact the person directly using the contact details shown if they need a reply.</p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDecide(null)}>Cancel</Button>
            <Button type="submit" variant={decide?.status === 'declined' ? 'danger' : 'primary'}>Confirm</Button>
          </div>
        </form>
      </Dialog>

      {approve && (
        <ApproveDialog
          kind={kind as 'submissions' | 'notifications'}
          item={approve}
          onClose={() => setApprove(null)}
          onDone={() => {
            setApprove(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

interface Draft {
  fullName: string;
  gender: Gender;
  birthYear: string;
  otherParentName: string;
  living: 'yes' | 'no' | 'unknown';
  include: boolean;
}

function ApproveDialog({ kind, item, onClose, onDone }: { kind: 'submissions' | 'notifications'; item: ReviewItem; onClose: () => void; onDone: () => void }) {
  const session = useSession();
  const { index, fromSeed, reload } = useRegistry();
  const initialParent = kind === 'submissions' ? String(item.parentId ?? '') : '';
  const [parentId, setParentId] = useState(index.byId.has(initialParent) ? initialParent : '');
  const [status, setStatus] = useState<Person['status']>('verified');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const proposed: Draft[] =
    kind === 'submissions'
      ? ((item.children as { fullName: string; gender?: Gender; birthYear?: string; otherParentName?: string }[]) ?? []).map((c) => ({
          fullName: c.fullName,
          gender: c.gender ?? 'unknown',
          birthYear: c.birthYear ?? '',
          otherParentName: c.otherParentName ?? '',
          living: 'unknown',
          include: true,
        }))
      : [{ fullName: String(item.personName ?? ''), gender: 'unknown', birthYear: '', otherParentName: '', living: 'unknown', include: true }];
  const [drafts, setDrafts] = useState<Draft[]>(proposed);
  const parent = parentId ? index.byId.get(parentId) : undefined;

  const upd = (i: number, patch: Partial<Draft>) => setDrafts((d) => d.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const submit = async () => {
    setError(null);
    if (fromSeed) return setError('Import the family registry into the database first (Family registry page).');
    if (!parent) return setError('Choose the parent in the family tree.');
    const chosen = drafts.filter((d) => d.include && d.fullName.trim());
    if (!chosen.length) return setError('Select at least one person with a name.');
    setBusy(true);
    try {
      const persons: Omit<Person, 'id'>[] = chosen.map((d) => ({
        fullName: d.fullName.trim(),
        kind: 'person',
        gender: d.gender,
        generation: parent.generation + 1,
        parentId: parent.id,
        parentRole: parent.gender === 'male' ? 'father' : parent.gender === 'female' ? 'mother' : 'unknown',
        parentLinkStatus: 'confirmed',
        otherParentName: d.otherParentName || undefined,
        status,
        isLiving: d.living === 'unknown' ? undefined : d.living === 'yes',
        birthYear: d.birthYear || undefined,
        branchId: parent.branchId,
        sourceRef: `Approved from ${String(item.receiptCode ?? item.id)}`,
      }));
      await approveWithPersons(session, kind, item, persons, note);
      reload();
      onDone();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Add to the family tree" wide>
      <div className="space-y-5">
        {fromSeed && <Alert tone="error">The family registry has not been imported into the database yet. Import it on the Family registry page first.</Alert>}
        <PersonPicker index={index} value={parentId} onChange={setParentId} label="Parent in the family tree" />
        {kind === 'notifications' && (
          <p className="text-sm text-muted">Sender said — father: {String(item.fatherName ?? '—')}, mother: {String(item.motherName ?? '—')}, generation: {String(item.generation ?? '—')}.</p>
        )}
        {drafts.map((d, i) => (
          <fieldset key={i} className="rounded-md border border-line p-4">
            <legend className="px-1 font-semibold">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" className="h-5 w-5 accent-primary" checked={d.include} onChange={(e) => upd(i, { include: e.target.checked })} /> Include person {i + 1}
              </label>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required className="sm:col-span-2">
                {(p) => <input {...p} className={inputClass} value={d.fullName} onChange={(e) => upd(i, { fullName: e.target.value })} maxLength={160} />}
              </Field>
              <Field label="Sex">
                {(p) => (
                  <select {...p} className={inputClass} value={d.gender} onChange={(e) => upd(i, { gender: e.target.value as Gender })}>
                    <option value="unknown">Unknown</option><option value="female">Female</option><option value="male">Male</option>
                  </select>
                )}
              </Field>
              <Field label="Living?">
                {(p) => (
                  <select {...p} className={inputClass} value={d.living} onChange={(e) => upd(i, { living: e.target.value as Draft['living'] })}>
                    <option value="unknown">Unknown</option><option value="yes">Living</option><option value="no">Deceased</option>
                  </select>
                )}
              </Field>
              <Field label="Year of birth">
                {(p) => <input {...p} className={inputClass} value={d.birthYear} onChange={(e) => upd(i, { birthYear: e.target.value })} maxLength={12} />}
              </Field>
              <Field label="Other parent">
                {(p) => <input {...p} className={inputClass} value={d.otherParentName} onChange={(e) => upd(i, { otherParentName: e.target.value })} maxLength={160} />}
              </Field>
            </div>
          </fieldset>
        ))}
        <Field label="Record status">
          {(p) => (
            <select {...p} className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Person['status'])}>
              <option value="verified">Confirmed by the family</option>
              <option value="unconfirmed">Added, awaiting confirmation</option>
            </select>
          )}
        </Field>
        <Field label="Review note" optionalText="optional">
          {(p) => <input {...p} className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />}
        </Field>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Approve and add'}</Button>
        </div>
      </div>
    </Dialog>
  );
}
