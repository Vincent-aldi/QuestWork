import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';
import { colors, fonts } from '../../theme/tokens';
import { fmtEn } from '../../utils/format';

interface Props {
  streak: number;
  points: number;
  level: number;
  initials: string;
  photoUri?: string;
  onAvatarPress: () => void;
}

export const HEADER_HEIGHT = 80;

export default function HeaderBar({ streak, points, level, initials, photoUri, onAvatarPress }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="sword-cross" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandName}>QUESTWORK</Text>
            <Text style={styles.brandSub}>Quest Log</Text>
          </View>
        </View>

        <View style={styles.right}>
          <View style={styles.streakPill}>
            <Text style={styles.emoji}>🔥</Text>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakUnit}>Hari</Text>
          </View>

          <View style={styles.pointsPill}>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.pointsText}>{fmtEn(points)}</Text>
          </View>

          <Pressable onPress={onAvatarPress} accessibilityLabel="Menu profil">
            <LinearGradient
              colors={[colors.primary, colors.gold, colors.green]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.ring}
            >
              <Avatar initials={initials} photoUri={photoUri} size={32} />
            </LinearGradient>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{level}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(11,19,38,0.96)',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.outfitBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.4,
    color: colors.primarySoft,
  },
  brandSub: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  right: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(34,42,61,0.9)',
    borderBottomWidth: 2,
    borderBottomColor: colors.surface,
  },
  emoji: { fontSize: 12 },
  streakNum: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: colors.gold },
  streakUnit: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  pointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: colors.amber,
    borderBottomWidth: 2,
    borderBottomColor: '#653e00',
  },
  pointsText: { fontFamily: fonts.outfitExtraBold, fontSize: 14, lineHeight: 18, color: '#5b3800' },
  ring: { padding: 2, borderRadius: 9999 },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  levelText: { fontFamily: fonts.outfitBold, fontSize: 10, lineHeight: 12, color: colors.onPrimary },
});
