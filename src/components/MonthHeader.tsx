import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MONTHS } from '../format';
import { colors } from '../theme';
import { CircleButton } from './ui';

type Props = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

/** Navigasi bulan: ‹ November 2026 › */
export function MonthHeader({ year, month, onChange }: Props) {
  const shift = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    onChange(d.getFullYear(), d.getMonth());
  };
  return (
    <View style={styles.row}>
      <CircleButton label="‹" size={44} bg="rgba(0,0,0,0.08)" onPress={() => shift(-1)} accessibilityLabel="Bulan sebelumnya" />
      <Text style={styles.title}>
        {MONTHS[month]} {year}
      </Text>
      <CircleButton label="›" size={44} bg="rgba(0,0,0,0.08)" onPress={() => shift(1)} accessibilityLabel="Bulan berikutnya" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '500', color: colors.ink },
});
