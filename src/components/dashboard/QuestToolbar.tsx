import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, taskPalette } from '../../theme/tokens';
import type { Category, SortKey } from '../../types';

export type TabKey = 'semua' | Category;

// warna tab aktif = warna kategori (Mingguan teal • Bulanan midnight keputihan • Harian biru • Personal ungu)
const TABS: { key: TabKey; label: string; bg: string; shadow: string; fg: string; dot?: string }[] = [
  { key: 'semua', label: 'Semua', bg: colors.primary, shadow: colors.primaryShadow, fg: colors.onPrimary },
  { key: 'mingguan', label: 'Mingguan', bg: taskPalette.weekly.btn, shadow: taskPalette.weekly.btnShadow, fg: taskPalette.weekly.btnText, dot: taskPalette.weekly.accent },
  { key: 'bulanan', label: 'Bulanan', bg: taskPalette.monthly.btn, shadow: taskPalette.monthly.btnShadow, fg: taskPalette.monthly.btnText, dot: taskPalette.monthly.accent },
  { key: 'harian', label: 'Harian', bg: taskPalette.daily.btn, shadow: taskPalette.daily.btnShadow, fg: taskPalette.daily.btnText, dot: taskPalette.daily.accent },
  { key: 'personal', label: 'Personal', bg: taskPalette.personal.btn, shadow: taskPalette.personal.btnShadow, fg: taskPalette.personal.btnText, dot: taskPalette.personal.accent },
];

export const SORT_LABELS: Record<SortKey, string> = {
  deadline: 'Deadline terdekat',
  poin: 'Poin tertinggi',
};

interface Props {
  countdown: string;
  tab: TabKey;
  onTab: (t: TabKey) => void;
  sort: SortKey;
  onSort: (s: SortKey) => void;
}

export default function QuestToolbar({ countdown, tab, onTab, sort, onSort }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Papan Misi</Text>
        <Text style={styles.reset}>RESET: {countdown}</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              onPress={() => onTab(t.key)}
              style={[styles.tab, active && { backgroundColor: t.bg, borderBottomColor: t.shadow }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && { color: t.fg }]}>{t.label}</Text>
              {t.dot && <View style={[styles.dot, { backgroundColor: active ? t.fg : t.dot }]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Urutkan</Text>
        <View style={{ width: 218 }}>
          <Pressable style={styles.select} onPress={() => setOpen((v) => !v)}>
            <Text style={styles.selectText}>{SORT_LABELS[sort]}</Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primarySoft} />
          </Pressable>
          {open && (
            <View style={styles.menu}>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <Pressable
                  key={k}
                  style={styles.menuItem}
                  onPress={() => {
                    onSort(k);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.selectText, k === sort && { color: colors.primarySoft }]}>
                    {SORT_LABELS[k]}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  reset: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: colors.primarySoft,
  },
  tabs: {
    flexDirection: 'row',
    gap: 3,
    padding: 4,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontFamily: fonts.outfitBold,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: colors.textMuted,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sortRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  sortLabel: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 20,
    color: '#a6aec4',
    paddingTop: 10,
  },
  select: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  selectText: { fontFamily: fonts.outfitBold, fontSize: 12, lineHeight: 20, color: colors.text },
  menu: {
    marginTop: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceHighest,
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  menuItem: { paddingHorizontal: 12, paddingVertical: 10 },
});
