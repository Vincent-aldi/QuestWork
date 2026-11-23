import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { colors, fonts } from '../../theme/tokens';
import { fmtId } from '../../utils/format';
import type { LeaderEntry } from '../../types';

export type ChallengerData = LeaderEntry & { rank: number; exp: number };

export default function ChallengerRow({ item }: { item: ChallengerData }) {
  const streak = item.badge?.toLowerCase().includes('streak');
  const sub = [item.role || `Lv. ${item.level}`, item.questsDone != null ? `${item.questsDone} Quest Selesai` : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <View style={[styles.row, item.isMe && styles.rowMe]}>
      <View style={styles.rankCol}>
        <Text style={styles.rank}>{item.rank}</Text>
        {item.trend === 'up' ? (
          <MaterialCommunityIcons name="menu-up" size={18} color={colors.green} style={styles.arrow} />
        ) : item.trend === 'down' ? (
          <MaterialCommunityIcons name="menu-down" size={18} color={colors.danger} style={styles.arrow} />
        ) : (
          <Text style={styles.dash}>–</Text>
        )}
      </View>

      <Avatar initials={item.initials} photoUri={item.photoUri} size={44} />

      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.isMe ? `${item.name} (Kamu)` : item.name}
          </Text>
          {item.badge && (
            <View style={[styles.chip, streak && styles.chipStreak]}>
              <Text style={[styles.chipText, streak && { color: colors.danger }]} numberOfLines={1}>
                {item.badge}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
      </View>

      <View style={styles.points}>
        <MaterialCommunityIcons name="star-four-points" size={12} color={colors.gold} />
        <Text style={styles.pointsText}>{fmtId(item.exp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  rowMe: { backgroundColor: colors.surfaceHighest, borderWidth: 1, borderColor: colors.primary },
  rankCol: { width: 22, alignItems: 'center' },
  rank: { fontFamily: fonts.outfitExtraBold, fontSize: 18, lineHeight: 22, color: colors.text },
  arrow: { marginTop: -4 },
  dash: { fontFamily: fonts.outfitBold, fontSize: 14, lineHeight: 14, color: colors.textSubtle },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontFamily: fonts.outfitBold, fontSize: 15, lineHeight: 20, color: colors.text },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 9999,
    backgroundColor: colors.surfaceHighest,
  },
  chipStreak: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  chipText: { fontFamily: fonts.outfitBold, fontSize: 10, lineHeight: 15, color: colors.textMuted },
  sub: { fontFamily: fonts.jakartaRegular, fontSize: 11, lineHeight: 16, color: colors.textMuted },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: colors.surfaceHigh,
  },
  pointsText: { fontFamily: fonts.outfitExtraBold, fontSize: 13, color: colors.text },
});
