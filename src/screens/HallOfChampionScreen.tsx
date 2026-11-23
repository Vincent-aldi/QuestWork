import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../components/dashboard/Avatar';
import { colors, fonts } from '../theme/tokens';
import { fmtId } from '../utils/format';
import type { Champion, ChampionKind } from '../types';

interface Props {
  champions: Champion[]; // urut dari yang terbaru
  onBack: () => void;
}

const TABS: { key: ChampionKind; label: string }[] = [
  { key: 'week', label: 'Mingguan' },
  { key: 'month', label: 'Bulanan' },
  { key: 'season', label: 'Musim' },
];

const KIND_LABEL: Record<ChampionKind, string> = {
  week: 'Juara Mingguan',
  month: 'Juara Bulanan',
  season: 'Juara Musim',
};

export default function HallOfChampionScreen({ champions, onBack }: Props) {
  const [kind, setKind] = useState<ChampionKind>('season');

  // juara bertahan = catatan musim terbaru (jika belum ada, catatan terbaru apa pun)
  const reigning = champions.find((c) => c.kind === 'season') ?? champions[0];

  const stats = useMemo(() => {
    const titles = new Map<string, { name: string; initials: string; count: number; isMe?: boolean }>();
    champions.forEach((c) => {
      const cur = titles.get(c.name);
      if (cur) cur.count += 1;
      else titles.set(c.name, { name: c.name, initials: c.initials, count: 1, isMe: c.isMe });
    });
    const legends = [...titles.values()].sort((a, b) => b.count - a.count).slice(0, 3);
    const record = champions.reduce((m, c) => Math.max(m, c.exp), 0);
    return { legends, record, total: champions.length };
  }, [champions]);

  const list = champions.filter((c) => c.kind === kind);

  return (
    <View style={{ gap: 20 }}>
      <View style={styles.headRow}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Kembali">
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Hall of Champion</Text>
          <Text style={styles.sub}>Para juara yang tercatat di QuestWork</Text>
        </View>
      </View>

      {champions.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="trophy-outline" size={40} color={colors.textSubtle} />
          <Text style={styles.empty}>Belum ada juara tercatat. Juara pertama akan muncul di sini setelah periode berakhir.</Text>
        </View>
      ) : (
        <>
          {reigning && (
            <LinearGradient
              colors={['rgba(255,185,95,0.28)', colors.surface]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.hero}
            >
              <Text style={styles.heroTag}>JUARA BERTAHAN</Text>
              <MaterialCommunityIcons name="crown" size={30} color={colors.gold} />
              <View style={styles.heroAvatar}>
                <Avatar initials={reigning.initials} size={76} />
              </View>
              <Text style={styles.heroName}>{reigning.isMe ? `${reigning.name} (Kamu)` : reigning.name}</Text>
              <Text style={styles.heroMeta}>
                {reigning.periodLabel} • Lv. {reigning.level}
              </Text>
              <View style={styles.heroExp}>
                <MaterialCommunityIcons name="trophy" size={14} color={colors.gold} />
                <Text style={styles.heroExpText}>{fmtId(reigning.exp)} EXP</Text>
              </View>
            </LinearGradient>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.gold }]}>{stats.total}</Text>
              <Text style={styles.statLabel}>Juara tercatat</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primarySoft }]}>{stats.legends[0]?.count ?? 0}×</Text>
              <Text style={styles.statLabel}>Gelar terbanyak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.green }]}>{fmtId(stats.record)}</Text>
              <Text style={styles.statLabel}>Rekor EXP</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.section}>Legenda Terbanyak Juara</Text>
            {stats.legends.map((l, i) => (
              <View key={l.name} style={[styles.row, l.isMe && styles.rowMe]}>
                <Text style={[styles.rowRank, i === 0 && { color: colors.gold }]}>{i + 1}</Text>
                <Avatar initials={l.initials} size={40} />
                <Text style={[styles.rowName, { flex: 1 }]} numberOfLines={1}>
                  {l.isMe ? `${l.name} (Kamu)` : l.name}
                </Text>
                <View style={styles.titleCount}>
                  <MaterialCommunityIcons name="trophy" size={14} color={colors.gold} />
                  <Text style={styles.titleCountText}>{l.count} gelar</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: 12 }}>
            <Text style={styles.section}>Riwayat Juara</Text>
            <View style={styles.tabs}>
              {TABS.map((t) => {
                const on = t.key === kind;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setKind(t.key)}
                    style={[styles.tab, on && styles.tabOn]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.tabText, { color: on ? colors.onPrimary : colors.textMuted }]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {list.length === 0 ? (
              <Text style={styles.empty}>Belum ada {KIND_LABEL[kind].toLowerCase()} tercatat.</Text>
            ) : (
              <View style={{ gap: 8 }}>
                {list.map((c) => (
                  <View key={c.id} style={[styles.record, c.isMe && styles.rowMe]}>
                    <View style={styles.recordTrophy}>
                      <MaterialCommunityIcons name="trophy-award" size={22} color={colors.gold} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recordPeriod}>{c.periodLabel}</Text>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {c.isMe ? `${c.name} (Kamu)` : c.name}
                      </Text>
                      {c.runnersUp && c.runnersUp.length > 0 && (
                        <Text style={styles.recordRunners} numberOfLines={1}>
                          Disusul {c.runnersUp.join(' & ')}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.rowExp}>{fmtId(c.exp)} EXP</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.outfitExtraBold, fontSize: 24, lineHeight: 30, color: colors.text },
  sub: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  emptyBox: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    paddingVertical: 12,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,185,95,0.45)',
    overflow: 'hidden',
  },
  heroTag: { fontFamily: fonts.outfitBold, fontSize: 11, letterSpacing: 1.2, color: colors.gold },
  heroAvatar: { borderWidth: 3, borderColor: colors.gold, borderRadius: 9999, padding: 3 },
  heroName: { fontFamily: fonts.outfitExtraBold, fontSize: 20, lineHeight: 26, color: colors.text },
  heroMeta: { fontFamily: fonts.jakartaRegular, fontSize: 12, color: colors.textMuted },
  heroExp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,185,95,0.14)',
  },
  heroExpText: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.gold },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  statValue: { fontFamily: fonts.outfitExtraBold, fontSize: 18, lineHeight: 24 },
  statLabel: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 14, color: colors.textMuted },
  section: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  rowMe: { backgroundColor: colors.surfaceHighest, borderWidth: 1, borderColor: colors.primary },
  rowRank: { width: 24, textAlign: 'center', fontFamily: fonts.outfitBold, fontSize: 14, color: colors.textMuted },
  rowName: { fontFamily: fonts.outfitBold, fontSize: 14, lineHeight: 18, color: colors.text },
  rowExp: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.green },
  titleCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  titleCountText: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.gold },
  tabs: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 12, backgroundColor: colors.inputBg },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabOn: { backgroundColor: colors.primary, borderBottomColor: colors.primaryShadow },
  tabText: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  recordTrophy: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,185,95,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordPeriod: { fontFamily: fonts.jakartaBold, fontSize: 11, lineHeight: 14, color: colors.textFaint },
  recordRunners: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 14, color: colors.textMuted },
});
