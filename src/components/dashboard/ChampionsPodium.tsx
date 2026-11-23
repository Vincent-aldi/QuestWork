import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';
import { colors, fonts } from '../../theme/tokens';
import { fmtId, shortName } from '../../utils/format';
import type { LeaderEntry } from '../../types';

export type PodiumRow = LeaderEntry & { rank: number; exp: number };

interface Props {
  top3: PodiumRow[]; // sudah urut juara 1, 2, 3
  timeLeft: string | null; // mis. "2h 14j"; null = tanpa hitung mundur
  unit?: string;
}

const BRONZE = '#cd7f32';
const TONE = { 1: colors.gold, 2: colors.primarySoft, 3: BRONZE } as const;

export default function ChampionsPodium({ top3, timeLeft, unit = 'EXP' }: Props) {
  // urutan tampilan: juara 2, juara 1, juara 3
  const order = [top3[1], top3[0], top3[2]].filter(Boolean) as PodiumRow[];

  return (
    <LinearGradient colors={[colors.surfaceHigh, colors.surface]} style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <MaterialCommunityIcons name="trophy-award" size={22} color={colors.gold} />
          <Text style={styles.headTitle}>Hall of Champions</Text>
        </View>
        {timeLeft && (
          <View style={styles.headLeft}>
            <MaterialCommunityIcons name="timer-outline" size={16} color={colors.textMuted} />
            <Text style={styles.timeLeft}>Selesai dlm {timeLeft}</Text>
          </View>
        )}
      </View>

      <View style={styles.cols}>
        {order.map((r) => {
          const first = r.rank === 1;
          const tone = TONE[r.rank as 1 | 2 | 3];
          const size = first ? 88 : 72;
          return (
            <View key={r.id} style={[styles.col, !first && styles.colSide]}>
              <View style={{ alignItems: 'center' }}>
                {/* lencana atas: mahkota (#1) / medali (#2, #3) */}
                <View
                  style={[
                    styles.topBadge,
                    first
                      ? { backgroundColor: colors.gold, width: 40, height: 40, borderRadius: 20 }
                      : { backgroundColor: colors.bg, borderColor: colors.outline, borderWidth: 1 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={first ? 'crown' : 'medal'}
                    size={first ? 22 : 16}
                    color={first ? colors.bg : tone}
                  />
                </View>

                {/* lingkaran avatar; lencana peringkat menempel di bawahnya */}
                <View
                  style={[
                    styles.ring,
                    {
                      width: size + 12,
                      height: size + 12,
                      borderRadius: (size + 12) / 2,
                      borderColor: tone,
                      shadowColor: tone,
                      shadowOpacity: first ? 0.6 : 0.3,
                    },
                  ]}
                >
                  <Avatar initials={r.initials} photoUri={r.photoUri} size={size} />
                </View>
                <View
                  style={[
                    styles.rankBadge,
                    first ? { backgroundColor: colors.amber } : { backgroundColor: colors.surfaceHighest },
                  ]}
                >
                  <Text style={[styles.rankText, { color: first ? colors.bg : r.isMe ? colors.primarySoft : colors.text }]}>
                    #{r.rank}
                    {r.isMe ? ' Kamu' : ''}
                  </Text>
                </View>
              </View>

              <Text style={[styles.name, { color: first ? colors.gold : r.rank === 2 ? colors.primarySoft : colors.text }]} numberOfLines={1}>
                {shortName(r.name)}
              </Text>
              <Text style={styles.role} numberOfLines={1}>
                {r.role || `Lv. ${r.level}`}
              </Text>

              <View style={[styles.stat, first && styles.statFirst]}>
                <View style={styles.statRow}>
                  <Text style={[styles.statValue, first && { color: colors.gold }]}>{fmtId(r.exp)}</Text>
                  {r.trend && (
                    <MaterialCommunityIcons
                      name={r.trend === 'up' ? 'menu-up' : 'menu-down'}
                      size={22}
                      color={r.trend === 'up' ? colors.green : colors.danger}
                      style={{ marginLeft: -2 }}
                    />
                  )}
                </View>
                <Text style={styles.statLabel}>{unit}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12, overflow: 'visible' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headTitle: { fontFamily: fonts.outfitExtraBold, fontSize: 18, color: colors.text },
  timeLeft: { fontFamily: fonts.jakartaRegular, fontSize: 12, color: colors.textMuted },
  cols: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  col: { flex: 1, alignItems: 'center', gap: 2 },
  colSide: { paddingTop: 36 },
  topBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
    zIndex: 2,
  },
  ring: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  rankBadge: {
    marginTop: -12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    zIndex: 2,
  },
  rankText: { fontFamily: fonts.outfitBold, fontSize: 12 },
  name: { fontFamily: fonts.outfitExtraBold, fontSize: 17, lineHeight: 24, marginTop: 8, maxWidth: '100%' },
  role: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 16, color: colors.textMuted, maxWidth: '100%' },
  stat: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  statFirst: { backgroundColor: colors.surfaceHighest, paddingVertical: 16 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontFamily: fonts.outfitExtraBold, fontSize: 16, color: colors.text },
  statLabel: { fontFamily: fonts.outfitBold, fontSize: 11, letterSpacing: 1, color: colors.textMuted, marginTop: 2 },
});
