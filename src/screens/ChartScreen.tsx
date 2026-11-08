import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, Bar } from '../components/BarChart';
import { MonthHeader } from '../components/MonthHeader';
import { BigAmount, Card, LinkText } from '../components/ui';
import { daysInMonth, formatLongDate, monthKey, MONTHS, MONTHS_SHORT, rupiah, todayKey } from '../format';
import { monthTotal, useStore } from '../store';
import { colors } from '../theme';

type Props = {
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
  onOpenDay: (date: string) => void;
};

export function ChartScreen({ year, month, onChangeMonth, onOpenDay }: Props) {
  const { dailyTotals } = useStore();
  const mk = monthKey(year, month);

  // --- Grafik harian bulan terpilih
  const dailyBars: Bar[] = Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const key = `${mk}-${String(i + 1).padStart(2, '0')}`;
    return { key, label: String(i + 1), value: dailyTotals[key] ?? 0 };
  });
  const defaultDay = () => {
    const t = todayKey();
    if (t.startsWith(mk)) return t;
    const best = dailyBars.reduce((a, b) => (b.value > a.value ? b : a), dailyBars[0]);
    return best.key;
  };
  const [selectedDay, setSelectedDay] = useState<string>(defaultDay);
  useEffect(() => {
    if (!selectedDay.startsWith(mk)) setSelectedDay(defaultDay());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mk]);
  const selectedValue = dailyTotals[selectedDay] ?? 0;

  // --- Grafik 6 bulan terakhir (berakhir di bulan terpilih)
  const monthBars: Bar[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(year, month - 5 + i, 1);
    return {
      key: monthKey(d.getFullYear(), d.getMonth()),
      label: MONTHS_SHORT[d.getMonth()],
      value: monthTotal(dailyTotals, d.getFullYear(), d.getMonth()),
    };
  });
  const current = monthBars[5].value;
  const previous = monthBars[4].value;
  const diff = current - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card color={colors.pink}>
        <MonthHeader year={year} month={month} onChange={onChangeMonth} />
        <View style={styles.readout}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{formatLongDate(selectedDay)}</Text>
            <LinkText onPress={() => onOpenDay(selectedDay)}>Detail</LinkText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <BigAmount amount={selectedValue} size={56} />
            <Text style={styles.small}>{rupiah(selectedValue)}</Text>
          </View>
        </View>
        <BarChart
          bars={dailyBars}
          selectedKey={selectedDay}
          onSelect={setSelectedDay}
          labelEvery={5}
          highlightColor={colors.orange}
        />
        <Text style={styles.caption}>Pendapatan per hari · ketuk batang untuk melihat nilainya</Text>
      </Card>

      <Card color={colors.sky} notch="left">
        <Text style={styles.cardTitle}>6 bulan terakhir</Text>
        <View style={styles.readout}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              {MONTHS[month]} {year}
            </Text>
            <Text style={styles.small}>
              {previous === 0 && current === 0
                ? 'Belum ada data'
                : `${diff >= 0 ? '▲' : '▼'} ${rupiah(Math.abs(diff))}${pct !== null ? ` (${diff >= 0 ? '+' : ''}${pct}%)` : ''} dibanding bulan lalu`}
            </Text>
          </View>
          <BigAmount amount={current} size={56} />
        </View>
        <BarChart
          bars={monthBars}
          selectedKey={mk}
          onSelect={(key) => {
            const [y, m] = key.split('-').map(Number);
            onChangeMonth(y, m - 1);
          }}
          height={140}
          highlightColor={colors.blue}
        />
        <Text style={styles.caption}>Total per bulan · ketuk batang untuk berpindah bulan</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  cardTitle: { fontSize: 20, color: colors.ink },
  readout: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 12, marginBottom: 20, gap: 8 },
  label: { fontSize: 14, color: colors.ink },
  small: { fontSize: 13, color: colors.inkSoft },
  caption: { fontSize: 12, color: colors.inkSoft, marginTop: 10, textAlign: 'center' },
});
