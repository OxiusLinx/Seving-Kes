import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { compactText } from '../format';
import { colors } from '../theme';

export type Bar = { key: string; label: string; value: number };

type Props = {
  bars: Bar[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  height?: number;
  /** Tampilkan label sumbu-x hanya setiap n batang agar tidak bertumpuk. */
  labelEvery?: number;
  barColor?: string;
  highlightColor?: string;
};

/**
 * Grafik batang satu seri: batang tipis berujung bulat 4px yang menempel ke garis dasar,
 * jarak 2px antar batang, grid samar. Ketuk batang untuk memilihnya (pengganti tooltip).
 */
export function BarChart({
  bars,
  selectedKey,
  onSelect,
  height = 180,
  labelEvery = 1,
  barColor = colors.ink,
  highlightColor = colors.surface,
}: Props) {
  const max = Math.max(0, ...bars.map((b) => b.value));

  return (
    <View>
      <View style={[styles.plot, { height }]}>
        {/* Garis bantu di nilai maksimum */}
        {max > 0 && (
          <View style={[styles.gridLine, { top: 0 }]}>
            <Text style={styles.gridLabel}>{compactText(max)}</Text>
          </View>
        )}
        <View style={[styles.gridLine, { top: height / 2 }]} />
        <View style={styles.bars}>
          {bars.map((b) => {
            const h = max > 0 ? (b.value / max) * (height - 4) : 0;
            const selected = b.key === selectedKey;
            return (
              <Pressable
                key={b.key}
                onPress={() => onSelect(b.key)}
                style={styles.hit}
                accessibilityRole="button"
                accessibilityLabel={`${b.label}: ${b.value}`}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height: b.value > 0 ? Math.max(3, h) : 0,
                      backgroundColor: selected ? highlightColor : barColor,
                    },
                  ]}
                />
              </Pressable>
            );
          })}
        </View>
        <View style={styles.baseline} />
      </View>
      <View style={styles.labels}>
        {bars.map((b, i) => (
          <Text
            key={b.key}
            style={[styles.axisLabel, b.key === selectedKey && styles.axisLabelActive]}
          >
            {i % labelEvery === 0 || b.key === selectedKey ? b.label : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: { position: 'relative', justifyContent: 'flex-end' },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.25)',
  },
  gridLabel: { position: 'absolute', right: 0, top: -16, fontSize: 11, color: colors.inkSoft },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: '100%' },
  hit: { flex: 1, height: '100%', justifyContent: 'flex-end', paddingHorizontal: 1 },
  bar: { borderTopLeftRadius: 4, borderTopRightRadius: 4, width: '100%' },
  baseline: { height: 1, backgroundColor: colors.ink },
  labels: { flexDirection: 'row', marginTop: 4 },
  axisLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.inkSoft, marginHorizontal: -8 },
  axisLabelActive: { color: colors.ink, fontWeight: '700' },
});
