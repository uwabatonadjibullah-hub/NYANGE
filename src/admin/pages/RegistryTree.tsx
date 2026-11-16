import { BookText, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import FamilyTree from '../../components/FamilyTree';
import { Alert, Button, Dialog, Field, inputClass } from '../../components/ui';
import { getChildren, normalize, searchPersons } from '../../lib/genealogy';
import { useRegistry } from '../../lib/registry';
import type { Gender, Person } from '../../lib/types';
import { addChildren, savePerson } from '../api';
import { describeError, useSession } from '../context';

const YEAR_HINT = 'For example 1985. Leave empty if not known.';
const isYear = (v: string) => !v.trim() || /^[0-9]{3,4}$/.test(v.trim());

interface ChildDraft {
  key: number;
  fullName: string;
  gender: Gender;
  living: 'unknown' | 'yes' | 'no';
  birthYear: string;
  deathYear: string;
  otherParentName: string;
}

const emptyChild = (): ChildDraft => ({ key: Math.random(), fullName: '', gender: 'unknown', living: 'unknown', birthYear: '', deathYear: '', otherParentName: '' });

function AddChildrenDialog({ parent, onClose, onSaved }: { parent: Person; onClose: () => void; onSaved: (n: number) => void }) {
  const session = useSession();
  const { index } = useRegistry();
  const [rows, setRows] = useState<ChildDraft[]>([emptyChild()]);
  const [status, setStatus] = useState<Person['status']>('verified');
  const [error, setError] = useState<string | null>(null);
  const [dupOk, setDupOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const existing = getChildren(index, parent.id);
  const upd = (i: number, patch: Partial<ChildDraft>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const duplicates = rows.filter((r) => r.fullName.trim() && existing.some((e) => normalize(e.fullName) === normalize(r.fullName))).map((r) => r.fullName.trim());

  const save = async () => {
    setError(null);
    const filled = rows.filter((r) => r.fullName.trim() || r.birthYear.trim() || r.deathYear.trim() || r.otherParentName.trim());
    if (!filled.length) return setError('Write the name of at least one child.');
    if (filled.some((r) => !r.fullName.trim())) return setError('Every child needs a full name. Remove empty rows with “Remove”.');
    if (filled.some((r) => !isYear(r.birthYear) || !isYear(r.deathYear))) return setError('Years must be written as numbers, for example 1985.');
    if (duplicates.length && !dupOk) {
      setDupOk(true);
      return setError(`Already recorded under ${parent.fullName}: ${duplicates.join(', ')}. Press “Save” again only if this is a different person.`);
    }
    setBusy(true);
    try {
      const children: Omit<Person, 'id'>[] = filled.map((r) => ({
        fullName: r.fullName.trim(),
        kind: 'person',
        gender: r.gender,
        generation: parent.generation + 1,
        parentId: parent.id,
        parentRole: parent.gender === 'male' ? 'father' : parent.gender === 'female' ? 'mother' : 'unknown',
        parentLinkStatus: 'confirmed',
        otherParentName: r.otherParentName.trim() || undefined,
        status,
        isLiving: r.living === 'unknown' ? undefined : r.living === 'yes',
        birthYear: r.birthYear.trim() || undefined,
        deathYear: r.living === 'no' ? r.deathYear.trim() || undefined : undefined,
        branchId: parent.branchId,
        sourceRef: 'Added by the family administrators',
      }));
      await addChildren(session, parent, children);
      onSaved(children.length);
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title={`Add children of ${parent.fullName}`} wide>
      <div className="space-y-5">
        {existing.length > 0 && (
          <p className="text-muted">Already recorded: {existing.map((c) => c.fullName).join(', ')}.</p>
        )}
        {rows.map((r, i) => (
          <fieldset key={r.key} className="rounded-lg border-2 border-line p-4">
            <legend className="px-2 text-lg font-semibold text-primary">Child {i + 1}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required className="sm:col-span-2">
                {(p) => <input {...p} className={inputClass} value={r.fullName} onChange={(e) => upd(i, { fullName: e.target.value })} maxLength={160} autoFocus={i === rows.length - 1} />}
              </Field>
              <Field label="Sex">
                {(p) => (
                  <select {...p} className={inputClass} value={r.gender} onChange={(e) => upd(i, { gender: e.target.value as Gender })}>
                    <option value="unknown">Not known</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                )}
              </Field>
              <Field label="Alive?">
                {(p) => (
                  <select {...p} className={inputClass} value={r.living} onChange={(e) => upd(i, { living: e.target.value as ChildDraft['living'] })}>
                    <option value="unknown">Not known</option>
                    <option value="yes">Alive</option>
                    <option value="no">Passed away</option>
                  </select>
                )}
              </Field>
              <Field label="Year of birth" hint={YEAR_HINT}>
                {(p) => <input {...p} inputMode="numeric" className={inputClass} value={r.birthYear} onChange={(e) => upd(i, { birthYear: e.target.value })} maxLength={4} />}
              </Field>
              {r.living === 'no' && (
                <Field label="Year of death" hint={YEAR_HINT}>
                  {(p) => <input {...p} inputMode="numeric" className={inputClass} value={r.deathYear} onChange={(e) => upd(i, { deathYear: e.target.value })} maxLength={4} />}
                </Field>
              )}
              <Field label={`Other parent (the child’s ${parent.gender === 'male' ? 'mother' : parent.gender === 'female' ? 'father' : 'other parent'})`} className="sm:col-span-2">
                {(p) => <input {...p} className={inputClass} value={r.otherParentName} onChange={(e) => upd(i, { otherParentName: e.target.value })} maxLength={160} />}
              </Field>
            </div>
            {rows.length > 1 && (
              <Button variant="ghost" className="mt-2 text-danger" onClick={() => setRows((x) => x.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" aria-hidden /> Remove
              </Button>
            )}
          </fieldset>
        ))}
        {rows.length < 20 && (
          <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setRows((x) => [...x, emptyChild()])}>
            <Plus className="h-5 w-5" aria-hidden /> Add another child
          </Button>
        )}
        <Field label="How sure is the family?">
          {(p) => (
            <select {...p} className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as Person['status'])}>
              <option value="verified">Confirmed by the family</option>
              <option value="unconfirmed">Not yet confirmed</option>
            </select>
          )}
        </Field>
        <p className="text-sm text-muted">Living people’s birth years are never shown on the public website.</p>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : `Save ${rows.length > 1 ? `${rows.length} children` : 'child'}`}</Button>
        </div>
      </div>
    </Dialog>
  );
}

function StoryDialog({ person, onClose, onSaved }: { person: Person; onClose: () => void; onSaved: () => void }) {
  const session = useSession();
  const [story, setStory] = useState(person.note ?? '');
  const [living, setLiving] = useState<'unknown' | 'yes' | 'no'>(person.isLiving === undefined ? 'unknown' : person.isLiving ? 'yes' : 'no');
  const [birthYear, setBirthYear] = useState(person.birthYear ?? '');
  const [deathYear, setDeathYear] = useState(person.deathYear ?? '');
  const [place, setPlace] = useState(person.location ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const MAX = 2000;

  const save = async () => {
    setError(null);
    if (!isYear(birthYear) || !isYear(deathYear)) return setError('Years must be written as numbers, for example 1950.');
    setBusy(true);
    try {
      const { id, ...rest } = person;
      await savePerson(session, id, {
        ...rest,
        note: story.trim() || undefined,
        isLiving: living === 'unknown' ? undefined : living === 'yes',
        birthYear: birthYear.trim() || undefined,
        deathYear: living === 'no' ? deathYear.trim() || undefined : undefined,
        location: place.trim() || undefined,
      });
      onSaved();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title={`Story of ${person.fullName}`} wide>
      <div className="space-y-5">
        <Field label="Life story" hint={`What the family remembers about them: where they lived, their work, their character. ${story.length}/${MAX} characters.`}>
          {(p) => <textarea {...p} rows={9} className={inputClass} value={story} onChange={(e) => setStory(e.target.value.slice(0, MAX))} autoFocus />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Alive?">
            {(p) => (
              <select {...p} className={inputClass} value={living} onChange={(e) => setLiving(e.target.value as typeof living)}>
                <option value="unknown">Not known</option>
                <option value="yes">Alive</option>
                <option value="no">Passed away</option>
              </select>
            )}
          </Field>
          <Field label="Place (town, country)">
            {(p) => <input {...p} className={inputClass} value={place} onChange={(e) => setPlace(e.target.value)} maxLength={160} />}
          </Field>
          <Field label="Year of birth" hint={YEAR_HINT}>
            {(p) => <input {...p} inputMode="numeric" className={inputClass} value={birthYear} onChange={(e) => setBirthYear(e.target.value)} maxLength={4} />}
          </Field>
          {living === 'no' && (
            <Field label="Year of death" hint={YEAR_HINT}>
              {(p) => <input {...p} inputMode="numeric" className={inputClass} value={deathYear} onChange={(e) => setDeathYear(e.target.value)} maxLength={4} />}
            </Field>
          )}
        </div>
        <p className="text-sm text-muted">The story is shown on the person’s public page. For living people, the birth year and place stay private.</p>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save story'}</Button>
        </div>
      </div>
    </Dialog>
  );
}

/** Simple way to grow the family tree: find or tap a person, then add children or write their story. */
export default function RegistryTree({ onEditAdvanced, disabled }: { onEditAdvanced: (id: string) => void; disabled: boolean }) {
  const { index, reload } = useRegistry();
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const [addFor, setAddFor] = useState<{ person: Person; show: () => void } | null>(null);
  const [storyFor, setStoryFor] = useState<Person | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const results = useMemo(() => (q.trim() ? searchPersons(index, q).slice(0, 8) : []), [index, q]);

  const action = 'inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md px-4 text-lg font-semibold';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-white p-4">
        <label htmlFor="admin-tree-q" className="mb-2 block text-lg font-semibold">Find a person</label>
        <input id="admin-tree-q" type="search" className={inputClass} placeholder="Type a name" value={q} onChange={(e) => setQ(e.target.value)} />
        {results.length > 0 && (
          <ul className="mt-2 divide-y divide-line rounded-md border border-line">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="block min-h-12 w-full cursor-pointer px-3 py-2 text-left hover:bg-mint-soft"
                  onClick={() => {
                    setFocus(p.id);
                    setQ('');
                  }}
                >
                  <span className="font-semibold">{p.fullName}</span>
                  <span className="block text-sm text-muted">{p.parentId ? `Child of ${index.byId.get(p.parentId)?.fullName ?? '?'}` : 'Nyange Radjabu'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-muted">Or tap a name in the tree. Then choose <strong>Add children</strong> or <strong>Write their story</strong>.</p>
      </div>

      {focus && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mint-soft p-3">
          <span>Showing the line of <strong>{index.byId.get(focus)?.fullName}</strong></span>
          <Button variant="secondary" onClick={() => setFocus(null)}>Show the whole family</Button>
        </div>
      )}
      {done && <Alert tone="success">{done}</Alert>}

      <FamilyTree
        index={index}
        mode={focus ? 'lineage' : 'full'}
        focusId={focus}
        onTraceLineage={setFocus}
        renderActions={(person, helpers) => (
          <>
            <button type="button" disabled={disabled} onClick={() => { setDone(null); setAddFor({ person, show: helpers.showChildren }); }} className={`${action} bg-primary text-white hover:bg-primary-hover disabled:opacity-50`}>
              <UserPlus className="h-5 w-5" aria-hidden /> Add children
            </button>
            <button type="button" disabled={disabled} onClick={() => { setDone(null); setStoryFor(person); }} className={`${action} border-2 border-primary text-primary hover:bg-mint disabled:opacity-50`}>
              <BookText className="h-5 w-5" aria-hidden /> Write their story
            </button>
            <button type="button" onClick={() => onEditAdvanced(person.id)} className={`${action} text-primary underline`}>
              <Pencil className="h-5 w-5" aria-hidden /> All details
            </button>
          </>
        )}
      />

      {addFor && (
        <AddChildrenDialog
          parent={addFor.person}
          onClose={() => setAddFor(null)}
          onSaved={(n) => {
            const name = addFor.person.fullName;
            addFor.show();
            setAddFor(null);
            reload();
            setDone(`${n} ${n === 1 ? 'child' : 'children'} added under ${name}. They now appear on the public family tree.`);
          }}
        />
      )}
      {storyFor && (
        <StoryDialog
          person={storyFor}
          onClose={() => setStoryFor(null)}
          onSaved={() => {
            const name = storyFor.fullName;
            setStoryFor(null);
            reload();
            setDone(`Story of ${name} saved. It now appears on their public page.`);
          }}
        />
      )}
    </div>
  );
}
