'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DocumentContent } from './types';
interface DraftContextValue { drafts: Record<string, DocumentContent>; resetEpoch: number; setDraft: (id: string, content: DocumentContent) => void; clearDraft: (id: string) => void; clearAll: () => void }
const DraftContext = createContext<DraftContextValue | null>(null);
export function DraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<Record<string, DocumentContent>>({});
  const [resetEpoch, setResetEpoch] = useState(0);
  const hasDrafts = Object.keys(drafts).length > 0;
  useEffect(() => {
    if (!hasDrafts) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [hasDrafts]);
  const setDraft = useCallback((id: string, content: DocumentContent) => setDrafts(previous => ({ ...previous, [id]: content })), []);
  const clearDraft = useCallback((id: string) => setDrafts(previous => { const next = { ...previous }; delete next[id]; return next; }), []);
  const clearAll = useCallback(() => { setDrafts({}); setResetEpoch(previous => previous + 1); }, []);
  const value = useMemo(() => ({ drafts, resetEpoch, setDraft, clearDraft, clearAll }), [drafts, resetEpoch, setDraft, clearDraft, clearAll]);
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}
export function useDrafts() { const context = useContext(DraftContext); if (!context) throw new Error('DraftProvider is required'); return context; }
