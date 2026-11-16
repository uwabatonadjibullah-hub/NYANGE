import { AlertTriangle, Database, GitFork, ListTree, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Field, inputClass } from '../../components/ui';
import { findDataIssues, getChildren, getLineage, searchPersons } from '../../lib/genealogy';
import { useRegistry } from '../../lib/registry';
import type { Person } from '../../lib/types';
import { countPersonsInDb, deletePerson, importSeed, savePerson } from '../api';
import { describeError, useLoad, useSession } from '../context';
import { PersonPicker } from '../PersonPicker';
import RegistryTree from './RegistryTree';

type Draft = Omit<Person, 'id'>;

const emptyDraft = (parent?: Person): Draft => ({
  fullName: '',
  kind: 'person',
  gender: 'unknown',
  generation: parent ? parent.generation + 1 : 0,
  parentId: parent?.id,
  parentRole: parent ? (parent.gender === 'male' ? 'father' : parent.gender === 'female' ? 'mother' : 'unknown') : undefined,
  parentLinkStatus: parent ? 'confirmed' : undefined,
  status: 'verified',
  branchId: parent?.branchId,
});

export default function RegistryPage() {
  const session = useSession();
  const { index, reload } = useRegistry();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const dbCount = useLoad(() => countPersonsInDb(), []);
  const dbEmpty = dbCount.data === 0;

  const selectedId = params.get('id');
  const newParent = params.get('newChildOf');
  const view: 'tree' | 'advanced' = params.get('view') === 'advanced' || selectedId || newParent !== null ? 'advanced' : 'tree';
  const editing = selectedId ? index.byId.get(selectedId) : undefined;
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (editing) {
      const { id: _id, ...rest } = editing;
      setDraft(rest);
    } else if (newParent !== null) {
      setDraft(emptyDraft(index.byId.get(newParent)));
    } else setDraft(null);
  }, [selectedId, newParent, index]);

  // Clear old messages only when the admin opens a different record.
  const keepMessage = useRef(false);
  useEffect(() => {
    if (keepMessage.current) keepMessage.current = false;
    else setMessage(null);
  }, [selectedId, newParent]);

  const results = useMemo(() => searchPersons(index, q).slice(0, 60), [index, q]);
  const issues = useMemo(() => findDataIssues(index), [index]);

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    setMessage(null);
    try {
      keepMessage.current = true;
      await fn();
      setMessage({ tone: 'success', text: ok });
      reload();
      dbCount.reload();
    } catch (e) {
      setMessage({ tone: 'error', text: describeError(e) });
    } finally {
      setBusy(false);
    }
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const onParentChange = (pid: string) => {
    const parent = index.byId.get(pid);
    setDraft((d) => (d ? { ...d, parentId: pid, generation: parent ? parent.generation + 1 : d.generation, branchId: parent?.branchId ?? d.branchId } : d));
  };

  const save = () => {
    if (!draft) return;
    if (!draft.fullName.trim()) return setMessage({ tone: 'error', text: 'Full name is required.' });
    if (draft.generation > 0 && !draft.parentId) return setMessage({ tone: 'error', text: 'Choose the parent (everyone except Nyange Radjabu needs one).' });
    if (selectedId && draft.parentId && getLineage(index, draft.parentId).some((p) => p.id === selectedId)) {
      return setMessage({ tone: 'error', text: 'A person cannot be placed under one of their own descendants.' });
    }
    if (dbEmpty) return setMessage({ tone: 'error', text: 'Import the registry first (button above).' });
    // If the generation changed, re-number the whole branch below this person.
    const shift = editing ? draft.generation - editing.generation : 0;
    const descendants: Person[] = [];
    if (editing && shift !== 0) {
      const stack = [...getChildren(index, editing.id)];
      while (stack.length) {
        const c = stack.pop()!;
        descendants.push({ ...c, generation: c.generation + shift });
        stack.push(...getChildren(index, c.id));
      }
    }
    run(async () => {
      const id = await savePerson(session, selectedId, draft, descendants);
      if (id !== selectedId) setParams({ id });
    }, 'Saved. The public family tree now shows this change.');
  };

  const remove = () => {
    if (!editing) return;
    if (getChildren(index, editing.id).length) return setMessage({ tone: 'error', text: 'This person has children in the registry. Move or remove the children first.' });
    if (!window.confirm(`Remove ${editing.fullName} from the family registry? This cannot be undone.`)) return;
    run(async () => {
      await deletePerson(session, editing);
      setParams({});
    }, 'Removed.');
  };

  return (
    <div>
      <h1 className="font-serif text-3xl">Family registry</h1>
      <p className="mt-1 max-w-3xl text-muted">Add, correct or remove people in the family tree. Every change is recorded in the activity log and appears on the public website immediately.</p>

      <div role="tablist" aria-label="Registry view" className="mt-4 flex gap-1 rounded-lg border border-line bg-white p-1 sm:w-fit">
        <button
          role="tab"
          aria-selected={view === 'tree'}
          onClick={() => setParams({})}
          className={`inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-lg font-semibold sm:flex-none ${view === 'tree' ? 'bg-primary text-white' : 'text-ink hover:bg-mint'}`}
        >
          <GitFork className="h-5 w-5" aria-hidden /> Family tree
        </button>
        <button
          role="tab"
          aria-selected={view === 'advanced'}
          onClick={() => setParams({ view: 'advanced' })}
          className={`inline-flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-lg font-semibold sm:flex-none ${view === 'advanced' ? 'bg-primary text-white' : 'text-ink hover:bg-mint'}`}
        >
          <ListTree className="h-5 w-5" aria-hidden /> Edit details
        </button>
      </div>

      {dbEmpty && (
        <div className="mt-4 rounded-lg border border-primary/30 bg-mint-soft p-5">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><Database className="h-5 w-5" aria-hidden /> Import the initial registry</h2>
          <p className="mt-2">The database is empty. Import the {index.all.length} records transcribed from the preliminary census report (Nyange Radjabu, the 8 family sections and their households). This is done once.</p>
          <Button className="mt-3" disabled={busy} onClick={() => run(async () => void (await importSeed(session)), 'Registry imported.')}>Import now</Button>
        </div>
      )}

      {message && <div className="mt-4"><Alert tone={message.tone}>{message.text}</Alert></div>}

      {view === 'tree' && (
        <div className="mt-6">
          <RegistryTree disabled={dbEmpty} onEditAdvanced={(id) => setParams({ id })} />
        </div>
      )}

      {view === 'advanced' && (
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section aria-label="People" className="rounded-lg border border-line bg-white p-4">
          <label htmlFor="reg-q" className="mb-1 block font-semibold">Search</label>
          <input id="reg-q" type="search" className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a name" />
          <ul className="mt-3 max-h-[60vh] divide-y divide-line overflow-y-auto">
            {results.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => setParams({ id: p.id })} className={`block min-h-11 w-full cursor-pointer px-2 py-2 text-left hover:bg-mint-soft ${p.id === selectedId ? 'bg-mint' : ''}`}>
                  <span className="font-medium">{p.fullName}</span>
                  <span className="block text-sm text-muted">gen {p.generation} · {p.status}{p.parentId ? ` · child of ${index.byId.get(p.parentId)?.fullName ?? '?'}` : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Edit person" className="rounded-lg border border-line bg-white p-5">
          {!draft ? (
            <p className="text-muted">Select a person to edit them, or open someone and use “Add a child”.</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <h2 className="font-serif text-2xl">{selectedId ? `Edit: ${editing?.fullName}` : 'New person'}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required className="sm:col-span-2">
                  {(p) => <input {...p} className={inputClass} value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} maxLength={160} />}
                </Field>
                {draft.generation > 0 && (
                  <div className="sm:col-span-2">
                    <PersonPicker index={index} value={draft.parentId} onChange={onParentChange} label="Parent (through whom they descend from Nyange Radjabu)" excludeId={selectedId ?? undefined} />
                  </div>
                )}
                <Field label="Parent is their">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.parentRole ?? 'unknown'} onChange={(e) => set('parentRole', e.target.value as Draft['parentRole'])}>
                      <option value="unknown">Unknown</option><option value="father">Father</option><option value="mother">Mother</option>
                    </select>
                  )}
                </Field>
                <Field label="Link to parent">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.parentLinkStatus ?? 'confirmed'} onChange={(e) => set('parentLinkStatus', e.target.value as Draft['parentLinkStatus'])}>
                      <option value="confirmed">Confirmed</option><option value="unconfirmed">Not yet confirmed</option>
                    </select>
                  )}
                </Field>
                <Field label="Other parent’s name">
                  {(p) => <input {...p} className={inputClass} value={draft.otherParentName ?? ''} onChange={(e) => set('otherParentName', e.target.value)} maxLength={160} />}
                </Field>
                <Field label="Sex">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.gender} onChange={(e) => set('gender', e.target.value as Draft['gender'])}>
                      <option value="unknown">Unknown</option><option value="female">Female</option><option value="male">Male</option>
                    </select>
                  )}
                </Field>
                <Field label="Record status">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.status} onChange={(e) => set('status', e.target.value as Draft['status'])}>
                      <option value="verified">Confirmed by the family</option>
                      <option value="listed">Listed in the 2026 report</option>
                      <option value="unconfirmed">Awaiting confirmation</option>
                    </select>
                  )}
                </Field>
                <Field label="Type of record">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.kind} onChange={(e) => set('kind', e.target.value as Draft['kind'])}>
                      <option value="person">Person</option>
                      <option value="family_section">Family section (report heading, person not confirmed)</option>
                    </select>
                  )}
                </Field>
                <Field label="Living?" hint="Living people never show birth year or place on the public site.">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.isLiving === undefined ? 'unknown' : draft.isLiving ? 'yes' : 'no'} onChange={(e) => set('isLiving', e.target.value === 'unknown' ? undefined : e.target.value === 'yes')}>
                      <option value="unknown">Unknown</option><option value="yes">Living</option><option value="no">Deceased</option>
                    </select>
                  )}
                </Field>
                <Field label="Descendants">
                  {(p) => (
                    <select {...p} className={inputClass} value={draft.descendantsStatus ?? 'unknown'} onChange={(e) => set('descendantsStatus', e.target.value as Draft['descendantsStatus'])}>
                      <option value="unknown">Not yet fully recorded</option>
                      <option value="none_confirmed">Family confirmed: no descendants</option>
                    </select>
                  )}
                </Field>
                <Field label="Year of birth">
                  {(p) => <input {...p} className={inputClass} value={draft.birthYear ?? ''} onChange={(e) => set('birthYear', e.target.value)} maxLength={12} />}
                </Field>
                <Field label="Year of death">
                  {(p) => <input {...p} className={inputClass} value={draft.deathYear ?? ''} onChange={(e) => set('deathYear', e.target.value)} maxLength={12} />}
                </Field>
                <Field label="Place">
                  {(p) => <input {...p} className={inputClass} value={draft.location ?? ''} onChange={(e) => set('location', e.target.value)} maxLength={160} />}
                </Field>
                <Field label="Confirmed birth order" hint="Only if the family confirmed it.">
                  {(p) => <input {...p} type="number" min={1} max={100} className={inputClass} value={draft.birthOrder ?? ''} onChange={(e) => set('birthOrder', e.target.value ? Number(e.target.value) : undefined)} />}
                </Field>
                <Field label="Members aged 15+ (census)">
                  {(p) => <input {...p} type="number" min={0} className={inputClass} value={draft.reportedCount15Plus ?? ''} onChange={(e) => set('reportedCount15Plus', e.target.value ? Number(e.target.value) : undefined)} />}
                </Field>
                <Field label="Source">
                  {(p) => <input {...p} className={inputClass} value={draft.sourceRef ?? ''} onChange={(e) => set('sourceRef', e.target.value)} maxLength={300} />}
                </Field>
                <Field label="Life story (shown on the public page)" className="sm:col-span-2">
                  {(p) => <textarea {...p} rows={3} className={inputClass} value={draft.note ?? ''} onChange={(e) => set('note', e.target.value)} maxLength={2000} />}
                </Field>
              </div>
              <p className="text-sm text-muted">Generation {draft.generation} (calculated from the parent).</p>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy}><Save className="h-4 w-4" aria-hidden /> Save</Button>
                {editing && (
                  <>
                    <Button variant="secondary" onClick={() => setParams({ newChildOf: editing.id })}><Plus className="h-4 w-4" aria-hidden /> Add a child</Button>
                    <Button variant="ghost" className="text-danger" onClick={remove} disabled={busy}><Trash2 className="h-4 w-4" aria-hidden /> Remove</Button>
                  </>
                )}
              </div>
            </form>
          )}
        </section>
      </div>

      )}

      {issues.length > 0 && (
        <section className="mt-8 rounded-lg border border-pending/30 bg-pending-soft p-5">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><AlertTriangle className="h-5 w-5 text-pending" aria-hidden /> Data checks ({issues.length})</h2>
          <p className="mt-1 text-muted">These need to be checked against the source documents with the family.</p>
          <ul className="mt-3 space-y-2">
            {issues.map((i, k) => (
              <li key={k}>
                <button type="button" className="cursor-pointer text-left text-primary underline" onClick={() => setParams({ id: i.personId })}>
                  {index.byId.get(i.personId)?.fullName ?? i.personId}
                </button>{' '}
                — {i.detail}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
