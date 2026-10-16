'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { demoReducer } from './domain';
import { restoreState, STORAGE_KEY } from './persistence';
import { createSeedState } from './seed';
import type { CampaignInput, DemoAction, DemoState } from './types';

interface DemoContextValue {
  state: DemoState;
  dispatch: Dispatch<DemoAction>;
  ready: boolean;
  storageWarning: string | null;
  notice: string | null;
  notify: (text: string) => void;
  createCampaign: (input: CampaignInput) => string;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);
const STORAGE_UNAVAILABLE = 'Browser storage is unavailable. Changes will only last while this demo remains open.';

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(demoReducer, undefined, createSeedState);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Server and first client render both use the same seed. Storage is only read after hydration.
  useEffect(() => {
    try {
      const restored = restoreState(window.localStorage.getItem(STORAGE_KEY));
      dispatch({ type: 'restore', state: restored.state });
      setStorageWarning(restored.warning ?? null);
    } catch { setStorageWarning(STORAGE_UNAVAILABLE); }
    setReady(true);
    return () => { if (noticeTimer.current !== undefined) clearTimeout(noticeTimer.current); };
  }, []);

  // The first effect must restore storage before this effect is allowed to write it.
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { setStorageWarning(STORAGE_UNAVAILABLE); }
  }, [state, ready]);

  const notify = useCallback((text: string) => {
    if (noticeTimer.current !== undefined) clearTimeout(noticeTimer.current);
    setNotice(text);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  const createCampaign = useCallback((input: CampaignInput) => {
    const id = `camp-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
    dispatch({ type: 'create', input, id, at: new Date().toISOString() });
    return id;
  }, []);

  const resetDemo = useCallback(() => {
    try { window.localStorage.removeItem(STORAGE_KEY); setStorageWarning(null); }
    catch { setStorageWarning(STORAGE_UNAVAILABLE); }
    dispatch({ type: 'reset' });
    notify('Demo reset. Your original sample campaigns are ready.');
  }, [notify]);

  const value = useMemo(() => ({ state, dispatch, ready, storageWarning, notice, notify, createCampaign, resetDemo }), [state, ready, storageWarning, notice, notify, createCampaign, resetDemo]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}
