import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { addDays, formatLongDate, groupDigits, parseAmount, rupiah, todayKey } from '../format';
import { useStore } from '../store';
import { colors } from '../theme';
import { Sheet } from './Sheet';
import { BigAmount, CircleButton } from './ui';

type Props = {
  /** Tanggal yang dibuka; null = sheet tertutup. */
  date: string | null;
  onClose: () => void;
};

/** Input pendapatan + daftar catatan pada satu tanggal. */
export function DaySheet({ date, onClose }: Props) {
  const { entries, dailyTotals, addEntry, removeEntry } = useStore();
  const [current, setCurrent] = useState(date ?? todayKey());
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (date) {
      setCurrent(date);
      setAmountText('');
      setNote('');
      setConfirmId(null);
    }
  }, [date]);

  const amount = parseAmount(amountText);
  const dayEntries = entries
    .filter((e) => e.date === current)
    .sort((a, b) => a.createdAt - b.createdAt);
  const total = dailyTotals[current] ?? 0;
  const isFuture = current > todayKey();

  const save = () => {
    if (amount <= 0) return;
    addEntry({ date: current, amount, note: note.trim() });
    setAmountText('');
    setNote('');
  };

  return (
    <Sheet visible={date !== null} title="Pendapatan" color={colors.mint} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* Pemilih tanggal */}
        <View style={styles.dateRow}>
          <CircleButton label="‹" size={44} bg="rgba(0,0,0,0.08)" onPress={() => setCurrent(addDays(current, -1))} accessibilityLabel="Hari sebelumnya" />
          <View style={styles.dateTextWrap}>
            <Text style={styles.dateText}>{formatLongDate(current)}</Text>
            {current !== todayKey() && (
              <Pressable onPress={() => setCurrent(todayKey())} hitSlop={8}>
                <Text style={styles.todayLink}>Kembali ke hari ini</Text>
              </Pressable>
            )}
          </View>
          <CircleButton label="›" size={44} bg="rgba(0,0,0,0.08)" onPress={() => setCurrent(addDays(current, 1))} accessibilityLabel="Hari berikutnya" />
        </View>

        <View style={styles.totalBlock}>
          <Text style={styles.label}>Total hari ini</Text>
          <BigAmount amount={total} size={72} />
          <Text style={styles.fullAmount}>{rupiah(total)}</Text>
        </View>

        {/* Form tambah */}
        <View style={styles.form}>
          <View style={styles.amountField}>
            <Text style={styles.prefix}>Rp</Text>
            <TextInput
              value={amount ? groupDigits(amount) : ''}
              onChangeText={setAmountText}
              placeholder="0"
              placeholderTextColor={colors.inkSoft}
              keyboardType="number-pad"
              style={styles.amountInput}
              accessibilityLabel="Nominal pendapatan"
              maxLength={17}
              returnKeyType="done"
              onSubmitEditing={save}
            />
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Keterangan (opsional), mis. Ojek pagi"
            placeholderTextColor={colors.inkSoft}
            style={styles.noteInput}
            maxLength={80}
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <Pressable
            onPress={save}
            disabled={amount <= 0}
            accessibilityRole="button"
            style={({ pressed }) => [styles.saveBtn, (pressed || amount <= 0) && { opacity: amount <= 0 ? 0.4 : 0.8 }]}
          >
            <Text style={styles.saveText}>Simpan</Text>
          </Pressable>
          {isFuture && <Text style={styles.hint}>Catatan: tanggal ini ada di masa depan.</Text>}
        </View>

        {/* Daftar catatan */}
        <Text style={[styles.label, { marginTop: 20, marginBottom: 8 }]}>
          Catatan ({dayEntries.length})
        </Text>
        {dayEntries.length === 0 && <Text style={styles.empty}>Belum ada pendapatan di tanggal ini.</Text>}
        {dayEntries.map((e) => (
          <View key={e.id} style={styles.entry}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryAmount}>{rupiah(e.amount)}</Text>
              {!!e.note && <Text style={styles.entryNote}>{e.note}</Text>}
            </View>
            {confirmId === e.id ? (
              <Pressable
                onPress={() => {
                  removeEntry(e.id);
                  setConfirmId(null);
                }}
                style={styles.confirmBtn}
                accessibilityRole="button"
              >
                <Text style={styles.confirmText}>Hapus?</Text>
              </Pressable>
            ) : (
              <CircleButton label="×" size={36} bg="rgba(0,0,0,0.08)" onPress={() => setConfirmId(e.id)} accessibilityLabel="Hapus catatan" />
            )}
          </View>
        ))}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateTextWrap: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '500', color: colors.ink, textAlign: 'center' },
  todayLink: { fontSize: 13, color: colors.inkSoft, textDecorationLine: 'underline', marginTop: 2 },
  totalBlock: { marginTop: 12, alignItems: 'flex-end' },
  label: { fontSize: 14, color: colors.inkSoft, alignSelf: 'flex-start' },
  fullAmount: { fontSize: 14, color: colors.inkSoft },
  form: { marginTop: 12, gap: 8 },
  amountField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  prefix: { fontSize: 22, color: colors.inkSoft, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28, paddingVertical: 12, color: colors.ink },
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
  },
  saveBtn: {
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveText: { color: colors.mint, fontSize: 20, fontWeight: '500' },
  hint: { fontSize: 13, color: colors.inkSoft, textAlign: 'center' },
  empty: { color: colors.inkSoft, fontSize: 15, paddingVertical: 8 },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.2)',
  },
  entryAmount: { fontSize: 18, color: colors.ink, fontWeight: '500' },
  entryNote: { fontSize: 14, color: colors.inkSoft, marginTop: 2 },
  confirmBtn: { backgroundColor: colors.orange, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  confirmText: { color: colors.ink, fontWeight: '500' },
});
