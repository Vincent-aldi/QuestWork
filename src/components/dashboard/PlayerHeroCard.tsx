import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import { colors, fonts } from '../../theme/tokens';
import { EXP_PER_LEVEL, LEVEL_TITLES } from '../../data/quests';
import { fmtId } from '../../utils/format';
import type { Player } from '../../types';

interface Props {
  player: Player;
  tasksLeft: number;
  potentialPoints: number;
}

export default function PlayerHeroCard({ player, tasksLeft, potentialPoints }: Props) {
  const pct = Math.min(100, (player.exp / EXP_PER_LEVEL) * 100);
  const remaining = EXP_PER_LEVEL - player.exp;
  const nextLevel = player.level + 1;
  const nextTitle = LEVEL_TITLES[nextLevel];

  return (
    <View style={styles.card}>
      {/* glow dekoratif (blur di desain → opacity rendah) */}
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <View>
            <View style={styles.avatarGlow}>
              <Avatar initials={player.initials} photoUri={player.photoUri} size={56} />
            </View>
            <View style={styles.rankBadge}>
              <MaterialCommunityIcons name="shield-star" size={12} color={colors.gold} />
            </View>
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{player.name}</Text>
              <MaterialCommunityIcons name="check-decagram" size={15} color={colors.primarySoft} />
            </View>
            <Text style={styles.role}>{player.role || 'Jabatan belum diisi'}</Text>
          </View>
        </View>

        <View style={styles.streakPill}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.streakText}>{player.streak} Hari</Text>
        </View>
      </View>

      <View style={styles.expBox}>
        <View style={styles.expTop}>
          <View style={styles.levelRow}>
            <Text style={styles.levelLabel}>LV. {player.level}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.rankTitle}>{LEVEL_TITLES[player.level] ?? 'Petualang'}</Text>
          </View>
          <Text style={styles.expText}>
            {fmtId(player.exp)} / {fmtId(EXP_PER_LEVEL)} EXP
          </Text>
        </View>

        <View style={styles.gauge}>
          <LinearGradient
            colors={[colors.primary, colors.primarySoft, colors.green]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.gaugeFill, { width: `${pct}%` }]}
          />
        </View>

        <Text style={styles.expHint}>
          {fmtId(remaining)} EXP lagi menuju Lv. {nextLevel}
          {nextTitle ? ` ${nextTitle}` : ''}
        </Text>
      </View>

      <View style={styles.chips}>
        <View style={[styles.chip, { backgroundColor: 'rgba(23,31,51,0.7)' }]}>
          <View style={[styles.chipIcon, { backgroundColor: 'rgba(108,92,231,0.2)' }]}>
            <MaterialCommunityIcons name="flag-variant" size={15} color={colors.primarySoft} />
          </View>
          <View>
            <Text style={[styles.chipValue, { color: colors.text }]}>{tasksLeft} Tugas</Text>
            <Text style={styles.chipLabel}>Sisa hari ini</Text>
          </View>
        </View>

        <View style={[styles.chip, { backgroundColor: 'rgba(238,152,0,0.15)' }]}>
          <View style={[styles.chipIcon, { backgroundColor: 'rgba(238,152,0,0.4)' }]}>
            <MaterialCommunityIcons name="database" size={15} color={colors.gold} />
          </View>
          <View>
            <Text style={[styles.chipValue, { color: colors.gold }]}>+{potentialPoints} Poin</Text>
            <Text style={styles.chipLabel}>Potensi reward</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceHighest,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  glowTop: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(108,92,231,0.16)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -48,
    left: -48,
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: 'rgba(255,185,95,0.1)',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  avatarGlow: {
    borderRadius: 28,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  role: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.outline,
    borderBottomWidth: 2,
    borderBottomColor: colors.surface,
  },
  emoji: { fontSize: 12 },
  streakText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: colors.gold },
  expBox: { backgroundColor: 'rgba(19,27,46,0.9)', borderRadius: 8, padding: 12, gap: 8 },
  expTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelLabel: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
    color: colors.primarySoft,
  },
  dot: { fontFamily: fonts.jakartaRegular, fontSize: 12, color: colors.textMuted },
  rankTitle: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  expText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: colors.green },
  gauge: { height: 12, borderRadius: 9999, backgroundColor: colors.inputBg, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 9999 },
  expHint: {
    textAlign: 'right',
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  chips: { flexDirection: 'row', gap: 8, paddingTop: 2 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8 },
  chipIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipValue: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 18 },
  chipLabel: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
});
