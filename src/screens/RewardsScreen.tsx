import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/tokens';
import { fmtId } from '../utils/format';
import type { Reward } from '../types';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  points: number;
  rewards: Reward[];
  redeemed: string[];
  onRedeem: (reward: Reward) => void;
}

const TONE = {
  primary: { fg: colors.primarySoft, bg: 'rgba(108,92,231,0.2)' },
  gold: { fg: colors.gold, bg: 'rgba(238,152,0,0.25)' },
  green: { fg: colors.green, bg: 'rgba(78,222,163,0.18)' },
} as const;

export default function RewardsScreen({ points, rewards, redeemed, onRedeem }: Props) {
  return (
    <View style={{ gap: 20 }}>
      <View>
        <Text style={styles.title}>Hadiah</Text>
        <Text style={styles.sub}>Tukarkan poinmu dengan hadiah menarik</Text>
      </View>

      <View style={styles.balance}>
        <View style={styles.balanceIcon}>
          <Text style={{ fontSize: 20 }}>⭐</Text>
        </View>
        <View>
          <Text style={styles.balanceLabel}>Poin kamu</Text>
          <Text style={styles.balanceValue}>{fmtId(points)}</Text>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        {rewards.map((r) => {
          const done = redeemed.includes(r.id);
          const missing = r.cost - points;
          const can = !done && missing <= 0;
          const tone = TONE[r.tone];
          return (
            <View key={r.id} style={[styles.card, done && { opacity: 0.6 }]}>
              <View style={[styles.cardIcon, { backgroundColor: tone.bg }]}>
                <MaterialCommunityIcons name={r.icon as MCIName} size={26} color={tone.fg} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.cardTitle}>{r.title}</Text>
                <Text style={styles.cardDesc}>{r.desc}</Text>
                <Text style={styles.cardCost}>⭐ {fmtId(r.cost)} Poin</Text>
              </View>
              <Pressable
                disabled={!can}
                onPress={() => onRedeem(r)}
                accessibilityRole="button"
                accessibilityState={{ disabled: !can }}
                style={[styles.btn, can ? styles.btnOn : styles.btnOff]}
              >
                <Text style={[styles.btnText, { color: can ? colors.onPrimary : colors.textSubtle }]}>
                  {done ? 'Ditukar' : can ? 'Tukar' : `Kurang ${fmtId(missing)}`}
                </Text>
              </Pressable>
            </View>
          );
        })}
        {rewards.length === 0 && <Text style={styles.empty}>Belum ada hadiah yang tersedia.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.outfitExtraBold, fontSize: 24, lineHeight: 30, color: colors.text },
  sub: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighest,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(238,152,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  balanceValue: { fontFamily: fonts.outfitExtraBold, fontSize: 24, lineHeight: 30, color: colors.gold },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  cardIcon: { width: 52, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.outfitBold, fontSize: 15, lineHeight: 20, color: colors.text },
  cardDesc: { fontFamily: fonts.jakartaRegular, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  cardCost: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 18, color: colors.gold },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 72, alignItems: 'center' },
  btnOn: { backgroundColor: colors.primary, borderBottomWidth: 3, borderBottomColor: colors.primaryShadow },
  btnOff: { backgroundColor: colors.outline },
  btnText: { fontFamily: fonts.outfitBold, fontSize: 12 },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: 24,
  },
});
