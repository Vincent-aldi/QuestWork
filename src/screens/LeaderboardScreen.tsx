import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '../components/dashboard/Avatar';
import PeriodTabs, { PERIOD_SUBTITLE } from '../components/dashboard/PeriodTabs';
import HallOfChampionScreen from './HallOfChampionScreen';
import { colors, fonts } from '../theme/tokens';
import { EXP_PER_LEVEL } from '../data/quests';
import ChampionsPodium from '../components/dashboard/ChampionsPodium';
import ChallengerRow from '../components/dashboard/ChallengerRow';
import { fmtId, timeLeftLabel } from '../utils/format';
import type { Champion, LeaderEntry, Period, Player } from '../types';

interface Props {
  player: Player;
  entries: LeaderEntry[];
  champions?: Champion[];
}

type Row = LeaderEntry & { rank: number; exp: number }; // exp = EXP pada periode terpilih

const MEDAL = { 1: colors.gold, 2: colors.primarySoft, 3: '#cd7f32' } as const;

export default function LeaderboardScreen({ player, entries, champions = [] }: Props) {
  const [period, setPeriod] = useState<Period>('week');
  const [hallOpen, setHallOpen] = useState(false);

  const rows: Row[] = useMemo(() => {
    const pick = (e: LeaderEntry) =>
      period === 'week' ? (e.weekExp ?? 0) : period === 'month' ? (e.monthExp ?? 0) : e.totalExp;
    const serverMe = entries.find((e) => e.isMe);
    const me: LeaderEntry = serverMe
      ? { ...serverMe, name: player.name, initials: player.initials, photoUri: player.photoUri }
      : {
      id: 'me',
      name: player.name,
      initials: player.initials,
      photoUri: player.photoUri,
      level: player.level,
      totalExp: player.level * EXP_PER_LEVEL + player.exp,
      weekExp: player.weekExp,
      monthExp: player.monthExp,
      isMe: true,
    };
    return [...entries.filter((e) => !e.isMe), me]
      .map((e) => ({ ...e, exp: pick(e) }))
      .sort((a, b) => b.exp - a.exp)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  }, [entries, player, period]);

  const mine = rows.find((r) => r.isMe)!;
  const above = rows[mine.rank - 2];
  const top3 = rows.slice(0, 3);
  const challengers = rows.slice(3, 10); // Penantang Tangguh = peringkat 4–10

  if (hallOpen) return <HallOfChampionScreen champions={champions} onBack={() => setHallOpen(false)} />;

  return (
    <View style={{ gap: 20 }}>
      <View>
        <Text style={styles.title}>Peringkat</Text>
        <Text style={styles.sub}>{PERIOD_SUBTITLE[period]}</Text>
      </View>

      <PeriodTabs value={period} onChange={setPeriod} />

      {entries.length > 0 && <ChampionsPodium top3={top3} timeLeft={timeLeftLabel(period)} />}

      <Pressable style={styles.historyLink} onPress={() => setHallOpen(true)} accessibilityRole="button">
        <MaterialCommunityIcons name="history" size={16} color={colors.gold} />
        <Text style={styles.historyText}>Lihat riwayat juara</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color={colors.gold} />
      </Pressable>

      {entries.length === 0 ? (
        <Text style={styles.empty}>Belum ada data peringkat.</Text>
      ) : (
        <>
          {challengers.length > 0 && (
            <View style={{ gap: 12 }}>
              <View style={styles.secHead}>
                <View style={styles.secLeft}>
                  <Text style={styles.secTitle}>Penantang Tangguh</Text>
                  <View style={styles.top10}>
                    <Text style={styles.top10Text}>Top 10</Text>
                  </View>
                </View>
                <Text style={styles.updated}>Diperbarui baru saja</Text>
              </View>
              {challengers.map((r) => (
                <ChallengerRow key={r.id} item={r} />
              ))}
            </View>
          )}
          {mine.rank > 10 && (
        <View style={styles.mineCard}>
          <View style={styles.mineRank}>
            <Text style={styles.mineRankText}>#{mine.rank}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.mineTitle}>Posisimu saat ini</Text>
            <Text style={styles.mineHint}>
              {above
                ? `${fmtId(above.exp - mine.exp)} EXP lagi untuk menyalip ${above.name}`
                : entries.length === 0
                  ? 'Belum ada pemain lain di papan peringkat'
                  : 'Kamu memimpin papan peringkat!'}
            </Text>
          </View>
          <Text style={styles.mineExp}>{fmtId(mine.exp)} EXP</Text>
        </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.outfitExtraBold, fontSize: 24, lineHeight: 30, color: colors.text },
  sub: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  historyLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: -8 },
  historyText: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.gold },
  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 16, color: colors.text },
  top10: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, backgroundColor: colors.surfaceHighest },
  top10Text: { fontFamily: fonts.outfitBold, fontSize: 11, color: colors.textMuted },
  updated: { fontFamily: fonts.jakartaRegular, fontSize: 11, color: colors.textMuted },
  mineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighest,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  mineRank: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mineRankText: { fontFamily: fonts.outfitExtraBold, fontSize: 16, color: colors.onPrimary },
  mineTitle: { fontFamily: fonts.outfitBold, fontSize: 14, lineHeight: 18, color: colors.text },
  mineHint: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  mineExp: { fontFamily: fonts.outfitExtraBold, fontSize: 14, color: colors.green },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: 24,
  },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  podiumCol: { flex: 1, alignItems: 'center', gap: 4 },
  podiumAvatar: { borderWidth: 2, borderRadius: 9999, padding: 2 },
  podiumName: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.text, maxWidth: '100%' },
  podiumExp: { fontFamily: fonts.outfitExtraBold, fontSize: 12 },
  podiumBase: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surfaceHigh,
  },
  podiumRank: { fontFamily: fonts.outfitExtraBold, fontSize: 20 },
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
  rowLevel: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  rowExp: { fontFamily: fonts.outfitBold, fontSize: 13, color: colors.green },
});
