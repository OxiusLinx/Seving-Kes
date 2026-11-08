import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { rupiah } from '../format';
import { parseBackup, useStore } from '../store';
import { colors } from '../theme';
import { Sheet } from './Sheet';

type Props = { visible: boolean; onClose: () => void };

/** Menu: backup (ekspor) dan pulihkan (impor) data dalam format JSON. */
export function MenuSheet({ visible, onClose }: Props) {
  const { entries, openingBalance, balance, replaceAll } = useStore();
  const [mode, setMode] = useState<'menu' | 'export' | 'import'>('menu');
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setMode('menu');
      setImportText('');
      setMessage('');
    }
  }, [visible]);

  const backupJson = JSON.stringify({ app: 'seving-kes', version: 2, openingBalance, entries }, null, 2);

  const share = async () => {
    try {
      await Share.share({ message: backupJson, title: 'Backup Seving Kes' });
    } catch {
      setMessage('Tidak bisa membuka menu bagikan. Salin teks di atas secara manual.');
    }
  };

  const doImport = () => {
    try {
      const parsed = parseBackup(importText);
      replaceAll(parsed);
      setMessage(`Berhasil memulihkan ${parsed.entries.length} catatan.`);
      setImportText('');
    } catch (err) {
      setMessage(`Gagal impor: ${(err as Error).message}`);
    }
  };

  return (
    <Sheet visible={visible} title="Menu" color={colors.sky} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.meta}>
          {entries.length} catatan · saldo {rupiah(balance)}
        </Text>

        {mode === 'menu' && (
          <View style={{ gap: 8 }}>
            <MenuItem label="Backup data (ekspor)" onPress={() => setMode('export')} />
            <MenuItem label="Pulihkan data (impor)" onPress={() => setMode('import')} />
          </View>
        )}

        {mode === 'export' && (
          <View style={{ gap: 8 }}>
            <Text style={styles.help}>Simpan teks ini di tempat aman (mis. kirim ke chat sendiri).</Text>
            <TextInput value={backupJson} multiline editable={false} style={styles.code} selectTextOnFocus />
            <MenuItem label="Bagikan…" dark onPress={share} />
          </View>
        )}

        {mode === 'import' && (
          <View style={{ gap: 8 }}>
            <Text style={styles.help}>
              Tempel teks backup di bawah. Data yang ada sekarang akan diganti.
            </Text>
            <TextInput
              value={importText}
              onChangeText={setImportText}
              multiline
              placeholder='{"entries": [...]}'
              placeholderTextColor={colors.inkSoft}
              style={styles.code}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <MenuItem label="Pulihkan" dark onPress={doImport} disabled={!importText.trim()} />
          </View>
        )}

        {!!message && <Text style={styles.message}>{message}</Text>}
        {mode !== 'menu' && (
          <Pressable onPress={() => setMode('menu')} hitSlop={8} style={{ marginTop: 12 }}>
            <Text style={styles.back}>‹ Kembali</Text>
          </Pressable>
        )}
      </ScrollView>
    </Sheet>
  );
}

function MenuItem({ label, onPress, dark, disabled }: { label: string; onPress: () => void; dark?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.item,
        dark && { backgroundColor: colors.ink },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
      ]}
    >
      <Text style={[styles.itemText, dark && { color: colors.sky }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  meta: { fontSize: 14, color: colors.inkSoft, marginBottom: 12 },
  help: { fontSize: 14, color: colors.ink },
  item: { backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 999, paddingVertical: 16, paddingHorizontal: 20 },
  itemText: { fontSize: 17, color: colors.ink, fontWeight: '500' },
  code: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 12,
    minHeight: 140,
    maxHeight: 240,
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  message: { marginTop: 12, fontSize: 14, color: colors.ink },
  back: { fontSize: 15, color: colors.inkSoft, textDecorationLine: 'underline' },
});
