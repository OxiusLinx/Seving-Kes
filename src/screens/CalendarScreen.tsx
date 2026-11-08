import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MonthHeader } from '../components/MonthHeader';
import { BigAmount, Card } from '../components/ui';
import { compactText, daysInMonth, monthKey, rupiah, todayKey, WEEKDAYS_SHORT } from '../format';
import { monthTotal, useStore } from '../store';
import { colors } from '../theme';

type Props = {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  onOpenDay: (date: string) => void;
};

export function CalendarScreen({ year, month, onChangeMonth, onOpenDay }: Props) {
  const { dailyTotals } = useStore();
  const total = monthTotal(dailyTotals, year, month);
  const count = daysInMonth(year, month);
  const mk = monthKey(year, month);
  const today = todayKey();

  const values = Array.from({ length: count }, (_, i) => dailyTotals[`${mk}-${String(i + 1).padStart(2, '0')}`] ?? 0);
  const max = Math.max(0, ...values);
  const activeDays = values.filter((v) => v > 0).length;

  // Kalender mulai hari Senin
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card color={colors.mint}>
        <MonthHeader year={year} month={month} onChange={onChangeMonth} />
        <Text style={styles.label}>Total bulan ini</Text>
        <BigAmount amount={total} size={88} />
        <Text style={styles.full}>{rupiah(total)}</Text>
      </Card>

      <Card color={colors.surface} notch="right">
        <View style={styles.weekRow}>
          {WEEKDAYS_SHORT.map((w) => (
            <Text key={w} style={styles.weekday}>
              {w}
            </Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              if (day === null) return <View key={di} style={styles.cell} />;
              const key = `${mk}-${String(day).padStart(2, '0')}`;
              const value = values[day - 1];
              // Skala sekuensial satu warna: makin besar pendapatan, makin pekat.
              const intensity = max > 0 && value > 0 ? 0.35 + 0.65 * (value / max) : 0;
              const isToday = key === today;
              return (
                <Pressable
                  key={di}
                  onPress={() => onOpenDay(key)}
                  accessibilityRole="button"
                  accessibilityLabel={`${day}, ${value > 0 ? rupiah(value) : 'tidak ada pendapatan'}`}
                  style={({ pressed }) => [styles.cell, pressed && { opacity: 0.6 }]}
                >
                  <View
                    style={[
                      styles.cellInner,
                      value > 0 && { backgroundColor: hexWithAlpha(colors.blue, intensity) },
                      isToday && styles.today,
                    ]}
                  >
                    <Text style={[styles.dayNum, intensity > 0.7 && { color: colors.surface }]}>{day}</Text>
                    <Text
                      style={[styles.dayAmt, intensity > 0.7 && { color: colors.surface }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {compactText(value)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
        <Text style={styles.tip}>Ketuk tanggal untuk melihat / menambah pendapatan.</Text>
      </Card>

      <Card color={colors.orange} notch="left">
        <Stat label="Hari berpendapatan" value={`${activeDays} / ${count} hari`} />
        <Stat label="Rata-rata per hari berpendapatan" value={rupiah(activeDays ? total / activeDays : 0)} />
        <Stat label="Pendapatan harian tertinggi" value={rupiah(max)} />
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function hexWithAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(2)})`;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  label: { fontSize: 14, color: colors.inkSoft, marginTop: 16 },
  full: { fontSize: 14, color: colors.inkSoft, textAlign: 'right' },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, color: colors.inkSoft, paddingVertical: 6 },
  cell: { flex: 1, aspectRatio: 0.8, padding: 2 },
  cellInner: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F2F2F4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  today: { borderWidth: 2, borderColor: colors.ink },
  dayNum: { fontSize: 15, color: colors.ink, fontWeight: '500' },
  dayAmt: { fontSize: 10, color: colors.ink, marginTop: 2 },
  tip: { fontSize: 12, color: colors.inkSoft, textAlign: 'center', marginTop: 10 },
  stat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  statLabel: { fontSize: 15, color: colors.ink, flex: 1 },
  statValue: { fontSize: 15, color: colors.ink, fontWeight: '600' },
});
