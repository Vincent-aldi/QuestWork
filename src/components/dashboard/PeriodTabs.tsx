import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';
import type { Period } from '../../types';

const TABS: { key: Period; label: string }[] = [
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'all', label: 'All-Time' },
];

export const PERIOD_SUBTITLE: Record<Period, string> = {
  week: 'Diurutkan berdasarkan EXP minggu ini',
  month: 'Diurutkan berdasarkan EXP bulan ini',
  all: 'Diurutkan berdasarkan total EXP',
};

interface Props {
  value: Period;
  onChange: (p: Period) => void;
}

export default function PeriodTabs({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, { color: active ? colors.onPrimary : colors.textMuted }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: { backgroundColor: colors.primary, borderBottomColor: colors.primaryShadow },
  text: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
});
