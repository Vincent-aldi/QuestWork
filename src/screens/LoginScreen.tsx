import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatusPill from '../components/StatusPill';
import HeroCard from '../components/HeroCard';
import LoginCard from '../components/LoginCard';
import UserCountBadge from '../components/UserCountBadge';
import { colors, fonts } from '../theme/tokens';
import type { LoginResult } from '../services/fakeAuth';

interface Props {
  onLoggedIn?: (result: LoginResult) => void;
}

export default function LoginScreen({ onLoggedIn }: Props) {
  const handleSuccess = (res: LoginResult) => {
    onLoggedIn?.(res);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Glow ungu di belakang pill (blur 64px di desain; RN tidak punya blur → opacity rendah) */}
          <View pointerEvents="none" style={styles.glow} />

          <View style={styles.pillWrap}>
            <StatusPill />
          </View>

          <HeroCard />

          <View style={styles.loginWrap}>
            <LoginCard
              onSuccess={handleSuccess}
              onForgot={() => Alert.alert('Lupa Kunci?', 'Fitur reset sandi belum tersedia (simulasi).')}
              onContactAdmin={() =>
                Alert.alert('Hubungi admin guild', 'Fitur ini belum tersedia (simulasi).')
              }
            />
          </View>

          <View style={styles.users}>
            <UserCountBadge />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  glow: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(108,92,231,0.18)',
  },
  pillWrap: { paddingTop: 16, paddingBottom: 16 },
  loginWrap: { marginTop: 16 },
  users: { marginTop: 16 },
  demoHint: {
    marginTop: 16,
    textAlign: 'center',
    fontFamily: fonts.jakartaRegular,
    fontSize: 11,
    color: colors.textSubtle,
  },
});
