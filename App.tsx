import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DaySheet } from './src/components/DaySheet';
import { BalanceSheet } from './src/components/BalanceSheet';
import { MenuSheet } from './src/components/MenuSheet';
import { CircleButton } from './src/components/ui';
import { todayKey } from './src/format';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { ChartScreen } from './src/screens/ChartScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { StoreProvider, useStore } from './src/store';
import { colors } from './src/theme';

type Tab = 'home' | 'calendar' | 'chart';

const TABS: { key: Tab; label: string; title: string }[] = [
  { key: 'home', label: 'Beranda', title: 'Seving Kes' },
  { key: 'calendar', label: 'Kalender', title: 'Kalender' },
  { key: 'chart', label: 'Grafik', title: 'Grafik' },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Main() {
  const insets = useSafeAreaInsets();
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const now = new Date();
  const [ym, setYm] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const changeMonth = (year: number, month: number) => setYm({ year, month });

  const title = TABS.find((t) => t.key === tab)!.title;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Header putih dengan sudut bawah membulat */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerActions}>
          <CircleButton label="+" onPress={() => setOpenDay(todayKey())} accessibilityLabel="Tambah pendapatan" />
          <CircleButton label="=" onPress={() => setMenuOpen(true)} accessibilityLabel="Menu" />
        </View>
      </View>

      <View style={styles.body}>
        {!ready ? (
          <ActivityIndicator color={colors.mint} style={{ marginTop: 40 }} />
        ) : tab === 'home' ? (
          <HomeScreen
            onOpenDay={setOpenDay}
            onGoCalendar={() => setTab('calendar')}
            onGoChart={() => setTab('chart')}
            onEditOpening={() => setBalanceOpen(true)}
          />
        ) : tab === 'calendar' ? (
          <CalendarScreen year={ym.year} month={ym.month} onChangeMonth={changeMonth} onOpenDay={setOpenDay} />
        ) : (
          <ChartScreen year={ym.year} month={ym.month} onChangeMonth={changeMonth} onOpenDay={setOpenDay} />
        )}
      </View>

      {/* Navigasi bawah: kartu cokelat dengan tombol bulat (gaya "On / Off") */}
      <View style={[styles.nav, { paddingBottom: insets.bottom + 10 }]}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={[styles.navItem, active ? styles.navItemActive : styles.navItemIdle]}
            >
              <Text style={[styles.navText, active && styles.navTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <DaySheet date={openDay} onClose={() => setOpenDay(null)} />
      <MenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <BalanceSheet visible={balanceOpen} onClose={() => setBalanceOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { flex: 1, fontSize: 28, fontWeight: '500', color: colors.ink, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  body: { flex: 1, paddingHorizontal: 0, marginTop: 4 },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.brown,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  navItem: { flex: 1, borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  navItemActive: { backgroundColor: colors.ink },
  navItemIdle: { backgroundColor: colors.brownDeep },
  navText: { fontSize: 16, color: colors.ink },
  navTextActive: { color: '#E8A07F' },
});
