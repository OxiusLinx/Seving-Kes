import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { groupDigits, parseAmount, rupiah } from '../format';
import { useStore } from '../store';
import { colors } from '../theme';
import { Sheet } from './Sheet';

type Props = { visible: boolean; onClose: () => void };

/** Mengatur saldo awal: uang yang sudah dimiliki sebelum mulai mencatat. */
export function BalanceSheet({ visible, onClose }: Props) {
  const { openingBalance, balance, setOpeningBalance } = useStore();
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible) setText(openingBalance ? String(openingBalance) : '');
  }, [visible, openingBalance]);

  const amount = parseAmount(text);
  const income = balance - openingBalance;

  const save = () => {
    setOpeningBalance(amount);
    onClose();
  };

  return (
    <Sheet visible={visible} title="Saldo awal" color={colors.yellow} onClose={onClose}>
      <Text style={styles.help}>
        Isi jumlah uang yang sudah Anda miliki sebelum mulai mencatat di Seving Kes. Saldo dihitung dari
        saldo awal ditambah semua pendapatan.
      </Text>
      <View style={styles.field}>
        <Text style={styles.prefix}>Rp</Text>
        <TextInput
          value={amount ? groupDigits(amount) : ''}
          onChangeText={setText}
          placeholder="0"
          placeholderTextColor={colors.inkSoft}
          keyboardType="number-pad"
          style={styles.input}
          maxLength={17}
          accessibilityLabel="Saldo awal"
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </View>
      <View style={styles.preview}>
        <Row label="Saldo awal" value={rupiah(amount)} />
        <Row label="Semua pendapatan" value={`+ ${rupiah(income)}`} />
        <View style={styles.divider} />
        <Row label="Saldo" value={rupiah(amount + income)} bold />
      </View>
      <Pressable
        onPress={save}
        accessibilityRole="button"
        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.saveText}>Simpan</Text>
      </Pressable>
    </Sheet>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  help: { fontSize: 14, color: colors.ink, marginBottom: 12, lineHeight: 20 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  prefix: { fontSize: 22, color: colors.inkSoft, marginRight: 8 },
  input: { flex: 1, fontSize: 28, paddingVertical: 12, color: colors.ink },
  preview: { marginTop: 16, gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 15, color: colors.inkSoft },
  rowValue: { fontSize: 15, color: colors.ink },
  bold: { fontWeight: '600', color: colors.ink, fontSize: 17 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.2)', marginVertical: 4 },
  saveBtn: {
    marginTop: 16,
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveText: { color: colors.yellow, fontSize: 20, fontWeight: '500' },
});
