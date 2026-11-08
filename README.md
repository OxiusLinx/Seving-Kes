# Seving Kes

Aplikasi mobile (React Native + Expo) untuk mencatat pendapatan harian dan melihat akumulasinya per bulan.

## Fitur

- **Input pendapatan** — nominal (Rupiah) + tanggal + keterangan opsional. Satu hari boleh berisi banyak catatan; total harian dijumlahkan otomatis. Catatan bisa dihapus.
- **Beranda** — kartu ringkasan: hari ini, minggu ini (Senin s/d hari ini), bulan ini, rata-rata per hari berpendapatan, dan hari terbaik bulan ini.
- **Kalender bulanan** — total per tanggal (warna makin pekat = pendapatan makin besar), total akumulasi bulan, navigasi antar bulan. Ketuk tanggal untuk melihat/menambah catatan.
- **Grafik** — grafik batang pendapatan per hari dalam satu bulan, dan total 6 bulan terakhir dengan perbandingan terhadap bulan lalu.
- **Backup** — menu `=` untuk ekspor data ke teks JSON (bisa dibagikan) dan impor kembali.

Data disimpan **lokal di perangkat** (AsyncStorage), tanpa login.

## Menjalankan

```bash
npm install
npx expo start
```

Lalu scan QR code dengan aplikasi **Expo Go** di HP (Android/iOS), atau tekan `w` untuk membuka versi web di browser.

## Struktur

```
App.tsx                  # header, tab bawah, sheet
src/store.tsx            # state & penyimpanan (AsyncStorage)
src/format.ts            # format tanggal & Rupiah
src/theme.ts             # palet warna
src/components/          # Card, BigAmount, Sheet, DaySheet, MenuSheet, BarChart, MonthHeader
src/screens/             # HomeScreen, CalendarScreen, ChartScreen
```
