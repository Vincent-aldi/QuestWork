import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme/tokens';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type NavKey = 'tugas' | 'peringkat' | 'hadiah' | 'profil';

const ITEMS: { key: NavKey; label: string; icon: MCIName }[] = [
  { key: 'tugas', label: 'Tugas', icon: 'clipboard-text' },
  { key: 'peringkat', label: 'Peringkat', icon: 'podium' },
  { key: 'hadiah', label: 'Hadiah', icon: 'gift' },
  { key: 'profil', label: 'Profil', icon: 'shield-account' },
];

export const NAV_HEIGHT = 64 + 16; // bar + padding atas/bawah

export default function BottomNav({ active, onPress }: { active: NavKey; onPress: (k: NavKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: 12 + insets.bottom }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {ITEMS.map((it) => {
          const on = it.key === active;
          return (
            <Pressable
              key={it.key}
              style={[styles.item, on && styles.itemOn]}
              onPress={() => onPress(it.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
            >
              <MaterialCommunityIcons
                name={it.icon}
                size={20}
                color={on ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.label, { color: on ? colors.primary : colors.textMuted }]}>
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 4, paddingHorizontal: 16 },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(19,27,46,0.96)',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
  },
  item: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 2,
  },
  itemOn: {
    backgroundColor: 'rgba(45,52,73,0.8)',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    transform: [{ scale: 1.05 }],
  },
  label: { fontFamily: fonts.outfitBold, fontSize: 11, lineHeight: 16 },
});
