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
const OPENING_KEY = 'seving-kes/opening-balance/v1';

type Store = {
  ready: boolean;
  entries: Entry[];
  /** Total per tanggal: { 'YYYY-MM-DD': number } */
  dailyTotals: Record<string, number>;
  /** Saldo awal: uang yang sudah ada sebelum mulai mencatat. */
  openingBalance: number;
  /** Saldo = saldo awal + semua pendapatan. */
  balance: number;
  setOpeningBalance: (amount: number) => void;
  addEntry: (e: Omit<Entry, 'id' | 'createdAt'>) => void;
  removeEntry: (id: string) => void;
  /** Mengganti seluruh data (dipakai untuk impor backup) */
  replaceAll: (backup: Backup) => void;
};

const StoreContext = createContext<Store | null>(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export type Backup = { entries: Entry[]; openingBalance?: number };

/** Validasi data impor agar data rusak tidak tersimpan. */
export function parseBackup(json: string): Backup {
  const raw = JSON.parse(json);
  const entries = parseEntries(Array.isArray(raw) ? raw : raw?.entries);
  if (raw && !Array.isArray(raw) && raw.openingBalance !== undefined) {
    const opening = Number(raw.openingBalance);
    if (!Number.isFinite(opening) || opening < 0) throw new Error('Saldo awal tidak valid');
    return { entries, openingBalance: Math.round(opening) };
  }
  return { entries };
}

function parseEntries(list: unknown): Entry[] {
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
  const [openingBalance, setOpening] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(OPENING_KEY)])
      .then(([json, opening]) => {
        if (json) setEntries(parseEntries(JSON.parse(json)));
        if (opening) setOpening(Number(opening) || 0);
      })
      .catch((err) => console.warn('Gagal memuat data', err))
      .finally(() => setReady(true));
  }, []);

  const setOpeningBalance = useCallback((amount: number) => {
    const value = Math.max(0, Math.round(amount));
    setOpening(value);
    AsyncStorage.setItem(OPENING_KEY, String(value)).catch((err) =>
      console.warn('Gagal menyimpan saldo awal', err),
    );
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

  const replaceAll = useCallback(
    (backup: Backup) => {
      persist(backup.entries);
      if (backup.openingBalance !== undefined) setOpeningBalance(backup.openingBalance);
    },
    [persist, setOpeningBalance],
  );

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of entries) totals[e.date] = (totals[e.date] ?? 0) + e.amount;
    return totals;
  }, [entries]);

  const balance = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, openingBalance),
    [entries, openingBalance],
  );

  const value = useMemo(
    () => ({
      ready,
      entries,
      dailyTotals,
      openingBalance,
      balance,
      setOpeningBalance,
      addEntry,
      removeEntry,
      replaceAll,
    }),
    [ready, entries, dailyTotals, openingBalance, balance, setOpeningBalance, addEntry, removeEntry, replaceAll],
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
