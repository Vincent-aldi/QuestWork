import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fonts } from '../theme/tokens';

interface Props {
  label: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  color: string;
  shadow: string;
  textColor: string;
  depth?: number;
  radius?: number;
  paddingH?: number;
  paddingV?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  background?: React.ReactNode; // mis. LinearGradient absolut di belakang label
}

/** Tombol "3D": bayangan solid di bawah, turun saat ditekan. */
export default function ChunkyButton({
  label,
  icon,
  iconRight,
  color,
  shadow,
  textColor,
  depth = 3,
  radius = 8,
  paddingH = 16,
  paddingV = 8,
  onPress,
  disabled,
  style,
  background,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={style}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: shadow,
            borderRadius: radius,
            paddingBottom: pressed && !disabled ? 1 : depth,
            marginTop: pressed && !disabled ? depth - 1 : 0,
          }}
        >
          <View
            style={[
              styles.inner,
              { backgroundColor: color, borderRadius: radius, paddingHorizontal: paddingH, paddingVertical: paddingV },
            ]}
          >
            {background}
            {icon}
            <Text style={[styles.label, { color: textColor }]}>{label}</Text>
            {iconRight}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  label: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, textAlign: 'center' },
});
