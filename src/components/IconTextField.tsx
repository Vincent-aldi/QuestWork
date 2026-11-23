import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, fonts } from '../theme/tokens';

interface Props extends TextInputProps {
  label: string;
  hint?: React.ReactNode; // elemen di kanan label (mis. "@PERUSAHAAN.CO.ID" / "Lupa Kunci?")
  leftIcon: React.ReactNode;
  rightAccessory?: React.ReactNode;
}

const IconTextField = forwardRef<React.ComponentRef<typeof TextInput>, Props>(
  ({ label, hint, leftIcon, rightAccessory, style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <View style={styles.wrap}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {hint}
        </View>
        <View style={[styles.inputWrap, focused && styles.inputFocused]}>
          <View style={styles.leftIcon}>{leftIcon}</View>
          <TextInput
            ref={ref}
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primarySoft}
            style={[styles.input, style]}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          {rightAccessory ? <View style={styles.right}>{rightAccessory}</View> : null}
        </View>
      </View>
    );
  },
);

export default IconTextField;

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.textMuted,
  },
  inputWrap: {
    height: 42,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  inputFocused: { borderColor: colors.primary },
  input: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingVertical: 0,
    height: '100%',
    fontFamily: fonts.jakartaRegular,
    fontSize: 14,
    color: colors.text,
  },
  leftIcon: { position: 'absolute', left: 13, top: 0, bottom: 0, justifyContent: 'center' },
  right: { position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center' },
});
