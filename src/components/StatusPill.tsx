import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/tokens';

export default function StatusPill() {
  return (
    <View style={styles.pill}>
      <Ionicons name="flash" size={12} color={colors.gold} />
      <Text style={styles.text}>SERVER ONLINE • REALM V4.2</Text>
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    backgroundColor: colors.surfaceHighest,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  text: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: colors.gold,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green, marginLeft: 4 },
});
