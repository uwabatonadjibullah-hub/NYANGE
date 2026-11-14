import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AdminSession } from './auth';

export const AdminSessionContext = createContext<AdminSession | null>(null);

export function useSession(): AdminSession {
  const s = useContext(AdminSessionContext);
  if (!s) throw new Error('No admin session');
  return s;
}

/** Small data loader with reload, loading and error state. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const run = useCallback(fn, deps);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    run()
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(describeError(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [run, tick]);
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}

export function describeError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  if (code === 'permission-denied') return 'You do not have permission for this action, or the data was rejected by the security rules.';
  if (code === 'unavailable') return 'The database could not be reached. Check your internet connection.';
  if (code === 'failed-precondition') return 'The database is not ready for this query (an index may be missing).';
  return 'Something went wrong. Please try again.';
}

export function formatDate(ts?: { toDate: () => Date }): string {
  if (!ts?.toDate) return '—';
  return ts.toDate().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
