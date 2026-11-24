import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ChunkyButton from './ChunkyButton';
import { colors, fonts } from '../theme/tokens';

type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  visible: boolean;
  icon: MCIName;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Warna aksi utama; default merah (aksi berbahaya). */
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const TONES = {
  danger: { accent: colors.danger, glow: 'rgba(255,138,138,0.16)', btn: '#ff8a8a', btnShadow: '#a23b3b', btnText: '#3a0a0a' },
  primary: { accent: colors.primarySoft, glow: 'rgba(108,92,231,0.22)', btn: colors.primary, btnShadow: '#3b2fa3', btnText: '#faf6ff' },
} as const;

/** Dialog konfirmasi bertema gelap (pengganti Alert bawaan sistem yang berwarna putih). */
export default function ConfirmDialog({
  visible,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  tone = 'danger',
  onConfirm,
  onCancel,
}: Props) {
  const t = TONES[tone];
  const anim = useRef(new Animated.Value(0)).current;

  // Masuk: latar memudar + kartu membesar pelan. Reset tiap dibuka.
  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [visible, anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Tutup dialog" />
        <Animated.View style={[styles.card, { transform: [{ scale }], borderColor: t.glow }]}>
          <View style={[styles.iconRing, { backgroundColor: t.glow }]}>
            <View style={[styles.iconCore, { borderColor: t.accent }]}>
              <MaterialCommunityIcons name={icon} size={30} color={t.accent} />
            </View>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <ChunkyButton
              label={cancelLabel}
              color={colors.surfaceHighest}
              shadow={colors.surfaceHigh}
              textColor={colors.text}
              paddingV={12}
              radius={12}
              onPress={onCancel}
              style={{ flex: 1 }}
            />
            <ChunkyButton
              label={confirmLabel}
              color={t.btn}
              shadow={t.btnShadow}
              textColor={t.btnText}
              paddingV={12}
              radius={12}
              onPress={onConfirm}
              style={{ flex: 1 }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    backgroundColor: 'rgba(5,8,22,0.78)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  iconRing: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  iconCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: 2,
  },
  title: { fontFamily: fonts.outfitBold, fontSize: 20, lineHeight: 26, color: colors.text, textAlign: 'center' },
  message: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  actions: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', marginTop: 4 },
});
