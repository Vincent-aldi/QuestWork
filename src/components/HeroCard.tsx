import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/tokens';
import { loginStats } from '../data/appData';

// Diunduh oleh scripts/download-assets.sh dari Figma (node 6:17)
const heroImage = require('../../assets/login/hero.png');

export default function HeroCard() {
  return (
    <View style={styles.card}>
      <View style={styles.banner}>
        <Image source={heroImage} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(23,31,51,0)', 'rgba(23,31,51,0.6)', colors.surfaceHigh]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {loginStats.xpBoost > 0 && (
          <View style={styles.xpBadge}>
            <Ionicons name="star" size={12} color={colors.gold} />
            <Text style={styles.xpText}>{loginStats.xpBoost}x XP Boost Aktif</Text>
          </View>
        )}

        <View style={styles.emblemRow}>
          <View style={styles.emblem}>
            <MaterialCommunityIcons name="shield-account" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.guildLabel}>GUILD OPERASIONAL</Text>
            <Text style={styles.guildName}>QuestWork Hub</Text>
          </View>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{'Siap Bertualang & Taklukkan\nTugas Hari Ini?'}</Text>
        <Text style={styles.subtitle}>
          Kumpulkan EXP, klaim loot mingguan, dan bawa squad divisimu memuncaki Leaderboard Kantor.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  banner: { height: 176, overflow: 'hidden' },
  xpBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(6,14,32,0.8)',
  },
  xpText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: colors.gold },
  emblemRow: {
    position: 'absolute',
    bottom: 4,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emblem: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  guildLabel: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.primarySoft,
  },
  guildName: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 20, color: colors.text },
  copy: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16, gap: 4 },
  title: {
    fontFamily: fonts.outfitBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
