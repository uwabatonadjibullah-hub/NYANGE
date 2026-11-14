import { createContext, lazy, Suspense, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NoticeType } from '../lib/types';

const RecordMeDialog = lazy(() => import('./RecordMeDialog'));

interface Ctx {
  openRecordMe: (type?: NoticeType) => void;
}
const RecordMeCtx = createContext<Ctx>({ openRecordMe: () => {} });

export function RecordMeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; type: NoticeType }>({ open: false, type: 'new_member' });
  const [mounted, setMounted] = useState(false);
  const openRecordMe = useCallback((type: NoticeType = 'new_member') => {
    setMounted(true);
    setState({ open: true, type });
  }, []);
  const value = useMemo(() => ({ openRecordMe }), [openRecordMe]);
  return (
    <RecordMeCtx.Provider value={value}>
      {children}
      {mounted && (
        <Suspense fallback={null}>
          <RecordMeDialog open={state.open} initialType={state.type} onClose={() => setState((s) => ({ ...s, open: false }))} />
        </Suspense>
      )}
    </RecordMeCtx.Provider>
  );
}

export const useRecordMe = () => useContext(RecordMeCtx);
