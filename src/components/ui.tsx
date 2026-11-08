import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';
import { compact } from '../format';

type CardProps = {
  color: string;
  /** Posisi "tab" penyambung di atas kartu, seperti pada referensi UI. */
  notch?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

export function Card({ color, notch, style, children }: CardProps) {
  return (
    <View style={[styles.card, { backgroundColor: color }, style]}>
      {notch && (
        <View
          pointerEvents="none"
          style={[styles.notch, { backgroundColor: color }, notch === 'left' ? { left: '18%' } : { right: '18%' }]}
        >
          <View style={styles.notchCut} />
        </View>
      )}
      {children}
    </View>
  );
}

export function IconBadge({ glyph, tint = 'rgba(0,0,0,0.08)' }: { glyph: string; tint?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: tint }]}>
      <Text style={styles.badgeGlyph}>{glyph}</Text>
    </View>
  );
}

type CircleButtonProps = {
  label: string;
  onPress: () => void;
  size?: number;
  bg?: string;
  fg?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function CircleButton({
  label,
  onPress,
  size = 48,
  bg = colors.chip,
  fg = colors.ink,
  accessibilityLabel,
  disabled,
}: CircleButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={6}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        styles.circle,
        (pressed || disabled) && { opacity: disabled ? 0.35 : 0.7 },
      ]}
    >
      <Text style={[styles.circleLabel, { color: fg, fontSize: size * 0.42 }]}>{label}</Text>
    </Pressable>
  );
}

/** Angka besar + satuan kecil di kanan bawah ("80 kmph" pada referensi). */
export function BigAmount({
  amount,
  size = 64,
  style,
}: {
  amount: number;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const { value, unit } = compact(amount);
  return (
    <View style={styles.bigRow}>
      <Text
        style={[styles.bigValue, { fontSize: size, lineHeight: size * 1.05 }, style]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={[styles.bigUnit, { fontSize: Math.max(12, size * 0.2) }]}>{unit}</Text>
    </View>
  );
}

export function LinkText({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="link">
      <Text style={styles.link}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    padding: 16,
    marginTop: 4,
  },
  notch: {
    position: 'absolute',
    top: -10,
    width: 44,
    height: 14,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    alignItems: 'center',
  },
  notchCut: {
    marginTop: 0,
    width: 14,
    height: 6,
    backgroundColor: colors.bg,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: { fontSize: 18, color: colors.ink },
  circle: { alignItems: 'center', justifyContent: 'center' },
  circleLabel: { fontWeight: '400' },
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' },
  bigValue: { color: colors.ink, fontWeight: '500', letterSpacing: -2, flexShrink: 1 },
  bigUnit: { color: colors.ink, marginLeft: 4, marginBottom: 8 },
  link: { textDecorationLine: 'underline', color: colors.inkSoft, fontSize: 16 },
});
