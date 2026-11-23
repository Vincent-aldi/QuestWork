import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import IconTextField from './IconTextField';
import { colors, fonts } from '../theme/tokens';
import { fakeGoogleLogin, isValidEmail, LoginResult } from '../services/fakeAuth';
import { login } from '../services/authApi';
import { GOOGLE_LOGIN_ENABLED } from '../config';

interface Props {
  onSuccess: (result: LoginResult) => void;
  onForgot?: () => void;
  onContactAdmin?: () => void;
}

export default function LoginCard({ onSuccess, onForgot, onContactAdmin }: Props) {
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || googleLoading;

  const handleLogin = async () => {
    if (busy) return;
    if (!identifier.trim() || !password) {
      setError('Isi email dan kata sandi dulu ya, Petualang.');
      return;
    }
    if (!isValidEmail(identifier)) {
      setError('Format email tidak valid. Contoh: andi@kantor.co.id');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await login({ identifier, password, remember });
      res.ok ? onSuccess(res) : setError(res.message ?? 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    if (!GOOGLE_LOGIN_ENABLED) {
      setError('Login Google belum terhubung. Gunakan email dan kata sandi.');
      return;
    }
    setError(null);
    setGoogleLoading(true);
    try {
      onSuccess(await fakeGoogleLogin());
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="lock-closed" size={13} color={colors.text} />
          <Text style={styles.headerTitle}>Gerbang Masuk Petualang</Text>
        </View>
        <View style={styles.ssoBadge}>
          <Text style={styles.ssoText}>SSO Aktif</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <IconTextField
          label="EMAIL KORPORAT"
          hint={<Text style={styles.domainHint}>@PERUSAHAAN.CO.ID</Text>}
          leftIcon={
            <MaterialCommunityIcons
              name="email-outline"
              size={16}
              color={colors.textSubtle}
            />
          }
          placeholder="misal: andi@kantor.co.id"
          value={identifier}
          onChangeText={(t) => {
            setIdentifier(t);
            if (error) setError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
        />

        <IconTextField
          ref={passwordRef}
          label="KATA SANDI / PIN GUILD"
          hint={
            <Pressable onPress={onForgot} hitSlop={8} accessibilityRole="link">
              <Text style={styles.forgot}>Lupa Kunci?</Text>
            </Pressable>
          }
          leftIcon={<Ionicons name="key" size={16} color={colors.textSubtle} />}
          rightAccessory={
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={8}
              style={styles.eyeBtn}
              accessibilityLabel="Tampilkan sandi"
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={17}
                color={colors.textSubtle}
              />
            </Pressable>
          }
          placeholder="••••••••••••"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (error) setError(null);
          }}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
          editable={!busy}
        />

        {/* Remember + enkripsi */}
        <View style={styles.rememberRow}>
          <Pressable
            style={styles.rememberLeft}
            onPress={() => setRemember((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
          >
            <View style={[styles.checkbox, remember && styles.checkboxOn]}>
              {remember && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.rememberText}>Simpan sesi petualangan ini</Text>
          </Pressable>
          <View style={styles.encrypt}>
            <Ionicons name="shield-checkmark" size={12} color={colors.gold} />
            <Text style={styles.encryptText}>256-bit Enkripsi</Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Tombol 3D utama */}
        <View style={styles.primaryWrap}>
          <Pressable onPress={handleLogin} disabled={busy} accessibilityRole="button">
            {({ pressed }) => (
              <View style={[styles.primaryShadow, pressed && { paddingBottom: 1, marginTop: 4 }]}>
                <View style={[styles.primaryBtn, busy && { opacity: 0.85 }]}>
                  {loading ? (
                    <ActivityIndicator color={colors.onPrimary} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="sword-cross"
                        size={17}
                        color={colors.onPrimary}
                      />
                      <Text style={styles.primaryText}>Mulai Misi (Login SSO Kantor)</Text>
                      <Ionicons name="arrow-forward" size={13} color={colors.onPrimary} />
                    </>
                  )}
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.dividerWrap}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerLabel}>ATAU TELEPORT CEPAT</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Workspace */}
      <Pressable
        onPress={handleGoogle}
        disabled={busy}
        style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
      >
        {googleLoading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#4285F4" />
            <Text style={styles.googleText}>Masuk via Google Workspace</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.noAccess}>
        {'Belum punya akses? '}
        <Text style={styles.noAccessLink} onPress={onContactAdmin}>
          Hubungi admin guild
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
  ssoBadge: {
    backgroundColor: 'rgba(0,130,89,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  ssoText: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.green,
  },
  form: { gap: 8 },
  domainHint: {
    fontFamily: fonts.jakartaBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.primarySoft,
  },
  forgot: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.primarySoft,
  },
  eyeBtn: { padding: 4 },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rememberLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  rememberText: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  encrypt: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  encryptText: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.gold,
  },
  error: {
    fontFamily: fonts.jakartaRegular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.danger,
  },
  primaryWrap: { paddingTop: 4 },
  primaryShadow: {
    backgroundColor: colors.primaryShadow,
    borderRadius: 12,
    paddingBottom: 5,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryText: {
    fontFamily: fonts.outfitBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.onPrimary,
    textAlign: 'center',
  },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.outline },
  dividerLabel: {
    fontFamily: fonts.outfitBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighest,
  },
  noAccess: {
    textAlign: 'center',
    fontFamily: fonts.outfitBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textFaint,
  },
  noAccessLink: { color: colors.primarySoft },
  googleText: { fontFamily: fonts.outfitBold, fontSize: 16, lineHeight: 22, color: colors.text },
});
