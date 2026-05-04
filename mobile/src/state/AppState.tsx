import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { COPY, type CopyDict } from '../data/copy';
import type { Lang } from '../data/types';

interface AppStateShape {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: CopyDict;
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  date: Date;
  setDate: (d: Date) => void;
}

const AppStateContext = createContext<AppStateShape | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('lt');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  const value = useMemo<AppStateShape>(
    () => ({
      lang,
      setLang,
      t: COPY[lang],
      savedIds,
      toggleSave,
      isSaved,
      date,
      setDate,
    }),
    [lang, savedIds, toggleSave, isSaved, date]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp(): AppStateShape {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider');
  return ctx;
}
