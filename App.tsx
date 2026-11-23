import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { colors } from './src/theme/tokens';
import { logout } from './src/services/authApi';
import { setUnauthorizedHandler } from './src/services/api';
import type { Player } from './src/types';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [startPlayer, setStartPlayer] = useState<Player | undefined>(undefined);

  // Sesi habis / dicabut di server (401) -> kembali ke layar login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setStartPlayer(undefined);
      setLoggedIn(false);
    });
    return () => setUnauthorizedHandler(null);
  }, []);
  const [loaded] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_700Bold,
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {loggedIn ? (
        <DashboardScreen
          initialPlayer={startPlayer}
          onLogout={() => {
            logout(); // cabut sesi di server + hapus token lokal
            setStartPlayer(undefined);
            setLoggedIn(false);
          }}
        />
      ) : (
        <LoginScreen
          onLoggedIn={(res) => {
            setStartPlayer(res.player);
            setLoggedIn(true);
          }}
        />
      )}
    </SafeAreaProvider>
  );
}
