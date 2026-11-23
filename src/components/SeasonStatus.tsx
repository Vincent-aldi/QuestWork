import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/tokens';

export default function SeasonStatus() {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.medal}>
          <MaterialCommunityIcons name="medal" size={22} color={colors.gold} />
        </View>
        <View style={{ flexShrink: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Musim 4: Tech Sprint</Text>
            <View style={styles.dot} />
          </View>
          <Text style={styles.sub}>{'Sisa Waktu: 14 Hari\nPetualangan'}</Text>
        </View>
      </View>

      <View style={styles.pool}>
        <Text style={styles.poolLabel}>TOTAL POOL</Text>
        <View style={styles.poolRow}>
          <MaterialCommunityIcons name="circle-multiple" size={12} color={colors.gold} />
          <Text style={styles.poolValue}>{'50.000\nPoin'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  medal: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(238,152,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  sub: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  pool: {
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
  },
  poolLabel: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: colors.textSubtle,
  },
  poolRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  poolValue: {
    fontFamily: fonts.outfitExtraBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.gold,
  },
});
