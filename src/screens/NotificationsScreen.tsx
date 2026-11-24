import React, { useEffect, useMemo, useState } from 'react';
import { AppState, BackHandler, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/tokens';
import { buildFeed } from '../services/notificationFeed';
import type { FeedItem, FeedTone } from '../services/notificationFeed';
import { getReminderPermission } from '../services/reminders';
import type { ReminderPermission } from '../services/reminders';
import type { Task } from '../types';

interface Props {
  tasks: Task[];
  onBack: () => void;
  onOpenTask: (taskId: string) => void;
}

const TONE: Record<FeedTone, { fg: string; bg: string }> = {
  danger: { fg: colors.danger, bg: 'rgba(255,138,138,0.16)' },
  gold: { fg: colors.gold, bg: 'rgba(255,185,95,0.16)' },
  primary: { fg: colors.primarySoft, bg: 'rgba(108,92,231,0.22)' },
  green: { fg: colors.green, bg: 'rgba(78,222,163,0.16)' },
};

function Row({ item, divider, onOpen }: { item: FeedItem; divider: boolean; onOpen: (id: string) => void }) {
  const tone = TONE[item.tone];
  return (
    <Pressable
      onPress={() => item.tappable && onOpen(item.taskId)}
      disabled={!item.tappable}
      style={[styles.row, divider && styles.rowDivider]}
      accessibilityRole={item.tappable ? 'button' : undefined}
    >
      <View style={[styles.rowIcon, { backgroundColor: tone.bg }]}>
        <MaterialCommunityIcons name={item.icon} size={18} color={tone.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {item.time ? <Text style={[styles.rowTime, { color: tone.fg }]}>{item.time}</Text> : null}
    </Pressable>
  );
}

function Section({ title, items, onOpen }: { title: string; items: FeedItem[]; onOpen: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((it, i) => (
          <Row key={it.id} item={it} divider={i > 0} onOpen={onOpen} />
        ))}
      </View>
    </View>
  );
}

export default function NotificationsScreen({ tasks, onBack, onOpenTask }: Props) {
  const insets = useSafeAreaInsets();
  const feed = useMemo(() => buildFeed(tasks), [tasks]);
  const [permission, setPermission] = useState<ReminderPermission>('granted');

  // Tombol back Android kembali ke Profil.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // Cek izin notifikasi, dan cek ulang saat pengguna kembali dari pengaturan HP.
  useEffect(() => {
    const check = () => getReminderPermission().then(setPermission);
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => sub.remove();
  }, []);

  const empty = feed.action.length + feed.upcoming.length + feed.updates.length === 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Kembali">
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifikasi Tugas & Deadline</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {permission !== 'granted' && (
          <View style={styles.banner}>
            <MaterialCommunityIcons name="bell-off-outline" size={20} color={colors.gold} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.bannerText}>
                Notifikasi aplikasi mati di HP, jadi pengingat deadline tidak akan muncul sebagai pop-up.
              </Text>
              <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
                <Text style={styles.bannerLink}>Buka Pengaturan</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Section title="Perlu Tindakan" items={feed.action} onOpen={onOpenTask} />
        <Section title="Deadline Mendatang" items={feed.upcoming} onOpen={onOpenTask} />
        <Section title="Pembaruan" items={feed.updates} onOpen={onOpenTask} />

        {empty && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="bell-check-outline" size={28} color={colors.textSubtle} />
            <Text style={styles.emptyText}>Belum ada notifikasi. Semua misi aman, Petualang!</Text>
          </View>
        )}

        <Text style={styles.footnote}>
          Pengingat muncul otomatis 1 hari dan 1 jam sebelum deadline. Daftar ini mengikuti kondisi tugasmu saat ini,
          jadi bisa dipakai mengecek ulang kalau pop-up-nya terhapus.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.outline },
  headerRow: { height: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
  },
  headerTitle: { flex: 1, fontFamily: fonts.outfitBold, fontSize: 18, color: colors.text },

  sectionTitle: { fontFamily: fonts.outfitBold, fontSize: 14, letterSpacing: 0.5, color: colors.textFaint },
  card: { borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outline, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.outline },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.outfitBold, fontSize: 14, color: colors.text },
  rowBody: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  rowTime: { fontFamily: fonts.outfitBold, fontSize: 12, maxWidth: 96, textAlign: 'right' },

  banner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,185,95,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,185,95,0.4)',
  },
  bannerText: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 17, color: colors.text },
  bannerLink: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.gold },

  emptyBox: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { fontFamily: fonts.jakartaRegular, fontSize: 13, color: colors.textSubtle, textAlign: 'center' },
  footnote: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 16, color: colors.textSubtle, textAlign: 'center' },
});
