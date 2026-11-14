import { collection, getDocs } from 'firebase/firestore/lite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildSeedPersons } from '../data/seed';
import { db } from './firebase';
import { buildIndex, type GenealogyIndex } from './genealogy';
import type { Person } from './types';

interface RegistryState {
  index: GenealogyIndex;
  loading: boolean;
  /** true while the database registry has not been imported yet and the bundled report data is shown. */
  fromSeed: boolean;
  reload: () => void;
}

const RegistryContext = createContext<RegistryState | null>(null);

const PERSON_FIELDS: (keyof Person)[] = [
  'fullName', 'kind', 'gender', 'generation', 'parentId', 'parentRole', 'parentLinkStatus', 'otherParentName',
  'status', 'isLiving', 'birthYear', 'deathYear', 'location', 'note', 'reportedCount15Plus', 'sourceRef',
  'reportOrder', 'birthOrder', 'branchId', 'descendantsStatus',
];

export function toPerson(id: string, data: Record<string, unknown>): Person {
  const p: Record<string, unknown> = { id };
  for (const f of PERSON_FIELDS) if (data[f] !== undefined && data[f] !== null) p[f] = data[f];
  return p as unknown as Person;
}

export async function fetchPersons(): Promise<Person[]> {
  const snap = await getDocs(collection(db, 'persons'));
  return snap.docs.map((d) => toPerson(d.id, d.data()));
}

export function RegistryProvider({ children }: { children: ReactNode }) {
  const seed = useMemo(() => buildSeedPersons(), []);
  const [persons, setPersons] = useState<Person[]>(seed);
  const [loading, setLoading] = useState(true);
  const [fromSeed, setFromSeed] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPersons()
      .then((list) => {
        if (!alive) return;
        if (list.length) {
          setPersons(list);
          setFromSeed(false);
        }
      })
      .catch(() => {
        /* Network or rules unavailable: keep showing the bundled report data. */
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [tick]);

  const index = useMemo(() => buildIndex(persons), [persons]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const value = useMemo(() => ({ index, loading, fromSeed, reload }), [index, loading, fromSeed, reload]);
  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry(): RegistryState {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useRegistry must be used inside RegistryProvider');
  return ctx;
}
