// Utilitas tanggal & format Rupiah (tanpa bergantung pada Intl agar aman di semua engine JS).

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
export const WEEKDAYS_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Tanggal lokal -> 'YYYY-MM-DD' */
export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM-DD' -> Date lokal (jam 12 siang untuk menghindari masalah DST) */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, days: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

/** 'YYYY-MM' */
export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month + 1)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Contoh: 'Minggu, 8 November 2026' */
export function formatLongDate(key: string): string {
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Contoh: '8 Nov 2026' */
export function formatShortDate(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** 1250000 -> '1.250.000' */
export function groupDigits(n: number): string {
  const sign = n < 0 ? '-' : '';
  return sign + String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** 1250000 -> 'Rp 1.250.000' */
export function rupiah(n: number): string {
  return `Rp ${groupDigits(n)}`;
}

function trimDecimal(n: number, digits: number): string {
  const fixed = n.toFixed(digits);
  // Hanya buang nol setelah koma desimal ('1.50' -> '1,5'), jangan nol pada bilangan bulat ('300').
  return (fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed).replace('.', ',');
}

/**
 * Angka besar + satuan kecil, gaya kartu "24° c" pada referensi.
 * 850 -> { value: '850', unit: 'rp' }, 250000 -> { '250', 'rb' }, 1250000 -> { '1,25', 'jt' }
 */
export function compact(n: number): { value: string; unit: string } {
  const abs = Math.abs(n);
  if (abs >= 1e9) return { value: trimDecimal(n / 1e9, 2), unit: 'M' };
  if (abs >= 1e6) return { value: trimDecimal(n / 1e6, abs >= 1e8 ? 0 : 2), unit: 'jt' };
  if (abs >= 1e3) return { value: trimDecimal(n / 1e3, abs >= 1e5 ? 0 : 1), unit: 'rb' };
  return { value: String(Math.round(n)), unit: 'rp' };
}

/** Teks ringkas satu baris, mis. '1,25jt' — untuk sel kalender & label grafik. */
export function compactText(n: number): string {
  if (n === 0) return '';
  const c = compact(n);
  return c.unit === 'rp' ? c.value : `${c.value}${c.unit}`;
}

/** '1.250.000' / 'Rp1250000' -> 1250000 */
export function parseAmount(text: string): number {
  const digits = text.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}
