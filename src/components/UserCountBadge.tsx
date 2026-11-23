import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { loginStats } from '../data/appData';

const PALETTE = [
  { bg: colors.outline, fg: colors.primarySoft },
  { bg: colors.amber, fg: '#5b3800' },
  { bg: colors.greenDeep, fg: '#e1ffec' },
];

export default function UserCountBadge() {
  const { userCount, avatars } = loginStats;
  return (
    <View style={styles.card}>
      {avatars.length > 0 && (
        <View style={styles.avatars}>
          {avatars.slice(0, 3).map((a, i) => {
            const c = PALETTE[i % PALETTE.length];
            return (
              <View
                key={`${a.initials}-${i}`}
                style={[styles.avatar, { backgroundColor: c.bg, marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]}
              >
                <Text style={[styles.avatarText, { color: c.fg }]}>{a.initials}</Text>
              </View>
            );
          })}
        </View>
      )}
      <Text style={styles.text}>Jumlah pengguna: {userCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 8,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.outfitSemiBold, fontSize: 12 },
  text: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 24, color: colors.textMuted },
});
