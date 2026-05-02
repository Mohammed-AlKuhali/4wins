import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../theme';
import { useAppFonts } from '../lib/fonts';
import { initI18n } from '../i18n';
import { registerSignOutHandler } from '../lib/api';
import { clearTokens } from '../lib/auth_state';
import { router } from 'expo-router';
import type { AppearanceOverride } from '../theme/ThemeProvider';
import * as SecureStore from 'expo-secure-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  const [i18nReady, setI18nReady] = useState(false);
  const [appearanceOverride, setAppearanceOverride] = useState<AppearanceOverride>('auto');

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
    SecureStore.getItemAsync('appearanceOverride').then((v) => {
      if (v === 'dark' || v === 'light' || v === 'auto') setAppearanceOverride(v as AppearanceOverride);
    });
    registerSignOutHandler(async () => {
      await clearTokens();
      router.replace('/(onboarding)/welcome');
    });
  }, []);

  if (!fontsLoaded || !i18nReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialOverride={appearanceOverride}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
