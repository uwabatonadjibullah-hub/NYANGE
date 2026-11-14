import { useMemo, useState } from 'react';
import { inputClass } from '../components/ui';
import { searchPersons, type GenealogyIndex } from '../lib/genealogy';

/** Search-and-pick a person from the registry (used to choose a parent). */
export function PersonPicker({ index, value, onChange, label, excludeId }: { index: GenealogyIndex; value?: string; onChange: (id: string) => void; label: string; excludeId?: string }) {
  const [q, setQ] = useState('');
  const selected = value ? index.byId.get(value) : undefined;
  const results = useMemo(() => (q.trim() ? searchPersons(index, q).filter((p) => p.id !== excludeId).slice(0, 8) : []), [index, q, excludeId]);
  return (
    <div>
      <label className="mb-1 block font-semibold" htmlFor="person-picker">{label}</label>
      {selected && (
        <p className="mb-2 rounded-md bg-mint-soft px-3 py-2">
          <strong>{selected.fullName}</strong> <span className="text-muted">· generation {selected.generation}</span>
        </p>
      )}
      <input id="person-picker" className={inputClass} type="search" placeholder="Type a name to search" value={q} onChange={(e) => setQ(e.target.value)} />
      {results.length > 0 && (
        <ul className="mt-1 max-h-60 overflow-y-auto rounded-md border border-line bg-white">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="block min-h-11 w-full cursor-pointer px-3 py-2 text-left hover:bg-mint-soft"
                onClick={() => {
                  onChange(p.id);
                  setQ('');
                }}
              >
                {p.fullName} <span className="text-sm text-muted">· gen {p.generation}{p.parentId ? ` · child of ${index.byId.get(p.parentId)?.fullName ?? '?'}` : ''}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
