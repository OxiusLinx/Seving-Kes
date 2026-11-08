import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BigAmount, Card, IconBadge, LinkText } from '../components/ui';
import { addDays, formatShortDate, fromKey, MONTHS, rupiah, todayKey } from '../format';
import { monthTotal, useStore } from '../store';
import { colors } from '../theme';

type Props = {
  onOpenDay: (date: string) => void;
  onGoCalendar: () => void;
  onGoChart: () => void;
  onEditOpening: () => void;
};

export function HomeScreen({ onOpenDay, onGoCalendar, onGoChart, onEditOpening }: Props) {
  const { dailyTotals, entries, balance, openingBalance } = useStore();
  const today = todayKey();
  const now = fromKey(today);
  const year = now.getFullYear();
  const month = now.getMonth();

  // Minggu berjalan: Senin s/d hari ini
  const weekdayIndex = (now.getDay() + 6) % 7; // Senin = 0
  let weekTotal = 0;
  for (let i = 0; i <= weekdayIndex; i++) weekTotal += dailyTotals[addDays(today, -i)] ?? 0;

  const thisMonth = monthTotal(dailyTotals, year, month);
  const prefix = today.slice(0, 8);
  const monthDays = Object.keys(dailyTotals).filter((k) => k.startsWith(prefix) && dailyTotals[k] > 0);
  const average = monthDays.length ? thisMonth / monthDays.length : 0;
  const bestDay = monthDays.reduce<string | null>(
    (best, k) => (best === null || dailyTotals[k] > dailyTotals[best] ? k : best),
    null,
  );

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SummaryCard
        color={colors.yellow}
        glyph="◎"
        title="Saldo"
        amount={balance}
        size={80}
        caption={openingBalance ? `Saldo awal ${rupiah(openingBalance)} + pendapatan` : 'Semua pendapatan'}
        link={openingBalance ? 'Ubah saldo awal' : 'Atur saldo awal'}
        onLink={onEditOpening}
      />
      <SummaryCard
        color={colors.mint}
        notch="right"
        glyph="☀"
        title="Hari ini"
        amount={dailyTotals[today] ?? 0}
        caption={formatShortDate(today)}
        link="Tambah"
        onLink={() => onOpenDay(today)}
      />
      <SummaryCard
        color={colors.orange}
        notch="left"
        glyph="◐"
        title="Minggu ini"
        amount={weekTotal}
        caption="Senin – hari ini"
        link="Grafik"
        onLink={onGoChart}
      />
      <SummaryCard
        color={colors.pink}
        notch="right"
        glyph="▦"
        title={`Bulan ${MONTHS[month]}`}
        amount={thisMonth}
        caption={`${monthDays.length} hari berpendapatan`}
        link="Kalender"
        onLink={onGoCalendar}
      />
      <SummaryCard
        color={colors.blue}
        notch="left"
        glyph="≈"
        title="Rata-rata harian"
        amount={average}
        caption="per hari berpendapatan, bulan ini"
      />
      <SummaryCard
        color={colors.sky}
        notch="right"
        glyph="★"
        title="Hari terbaik"
        amount={bestDay ? dailyTotals[bestDay] : 0}
        caption={bestDay ? formatShortDate(bestDay) : 'Belum ada data bulan ini'}
        link={bestDay ? 'Detail' : undefined}
        onLink={bestDay ? () => onOpenDay(bestDay) : undefined}
      />
      {entries.length === 0 && (
        <Text style={styles.empty}>Tekan tombol + di atas untuk mencatat pendapatan pertama Anda.</Text>
      )}
    </ScrollView>
  );
}

type SummaryProps = {
  color: string;
  notch?: 'left' | 'right';
  glyph: string;
  title: string;
  amount: number;
  caption: string;
  link?: string;
  onLink?: () => void;
  size?: number;
};

function SummaryCard({ color, notch, glyph, title, amount, caption, link, onLink, size = 64 }: SummaryProps) {
  return (
    <Card color={color} notch={notch}>
      <View style={styles.cardHead}>
        <IconBadge glyph={glyph} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardLeft}>
          {link && onLink ? <LinkText onPress={onLink}>{link}</LinkText> : null}
          <Text style={styles.caption} numberOfLines={2}>
            {caption}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <BigAmount amount={amount} size={size} />
          <Text style={styles.full}>{rupiah(amount)}</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 20, color: colors.ink },
  cardBody: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 4 },
  cardLeft: { flex: 1, gap: 2, paddingBottom: 4 },
  cardRight: { alignItems: 'flex-end', maxWidth: '65%' },
  caption: { fontSize: 13, color: colors.inkSoft },
  full: { fontSize: 13, color: colors.inkSoft, marginTop: -4 },
  empty: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 24, paddingHorizontal: 24 },
});
