import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Entry = {
  id: string;
  /** 'YYYY-MM-DD' */
  date: string;
  /** Nominal dalam Rupiah (bilangan bulat) */
  amount: number;
  note: string;
  createdAt: number;
};

const STORAGE_KEY = 'seving-kes/entries/v1';

type Store = {
  ready: boolean;
  entries: Entry[];
  /** Total per tanggal: { 'YYYY-MM-DD': number } */
  dailyTotals: Record<string, number>;
  addEntry: (e: Omit<Entry, 'id' | 'createdAt'>) => void;
  removeEntry: (id: string) => void;
  /** Mengganti seluruh data (dipakai untuk impor backup) */
  replaceAll: (entries: Entry[]) => void;
};

const StoreContext = createContext<Store | null>(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Validasi data impor agar data rusak tidak tersimpan. */
export function parseBackup(json: string): Entry[] {
  const raw = JSON.parse(json);
  const list = Array.isArray(raw) ? raw : raw?.entries;
  if (!Array.isArray(list)) throw new Error('Format tidak dikenali');
  return list.map((e: any) => {
    if (typeof e?.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
      throw new Error('Tanggal tidak valid');
    }
    const amount = Number(e.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Nominal tidak valid');
    return {
      id: typeof e.id === 'string' ? e.id : newId(),
      date: e.date,
      amount: Math.round(amount),
      note: typeof e.note === 'string' ? e.note : '',
      createdAt: Number(e.createdAt) || Date.now(),
    };
  });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setEntries(parseBackup(json));
      })
      .catch((err) => console.warn('Gagal memuat data', err))
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next: Entry[]) => {
    setEntries(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch((err) =>
      console.warn('Gagal menyimpan data', err),
    );
  }, []);

  const addEntry = useCallback<Store['addEntry']>(
    (e) => persist([...entries, { ...e, id: newId(), createdAt: Date.now() }]),
    [entries, persist],
  );

  const removeEntry = useCallback(
    (id: string) => persist(entries.filter((e) => e.id !== id)),
    [entries, persist],
  );

  const replaceAll = useCallback((next: Entry[]) => persist(next), [persist]);

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of entries) totals[e.date] = (totals[e.date] ?? 0) + e.amount;
    return totals;
  }, [entries]);

  const value = useMemo(
    () => ({ ready, entries, dailyTotals, addEntry, removeEntry, replaceAll }),
    [ready, entries, dailyTotals, addEntry, removeEntry, replaceAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore harus dipakai di dalam StoreProvider');
  return ctx;
}

/** Total satu bulan (month: 0-11) */
export function monthTotal(totals: Record<string, number>, year: number, month: number): number {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  let sum = 0;
  for (const k in totals) if (k.startsWith(prefix)) sum += totals[k];
  return sum;
}
