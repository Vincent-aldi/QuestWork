import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/tokens';

const AVATARS = [
  { label: 'DV', bg: colors.outline, fg: colors.primarySoft, size: 12 },
  { label: 'RK', bg: colors.amber, fg: '#5b3800', size: 12 },
  { label: 'AN', bg: colors.greenDeep, fg: '#e1ffec', size: 12 },
  { label: '+142', bg: colors.surfaceHighest, fg: colors.textMuted, size: 10 },
] as const;

export default function GuildRoster() {
  return (
    <View style={styles.row}>
      <View style={styles.avatars}>
        {AVATARS.map((a, i) => (
          <View
            key={a.label}
            style={[
              styles.avatar,
              { backgroundColor: a.bg, marginLeft: i === 0 ? 0 : -8, zIndex: AVATARS.length - i },
            ]}
          >
            <Text style={[styles.avatarText, { color: a.fg, fontSize: a.size }]}>{a.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.caption}>{'145 Petualang sedang menyelesaikan task hari\nini'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  avatars: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.outfitSemiBold },
  caption: {
    flexShrink: 1,
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
