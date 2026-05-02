import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Text } from '../../components/Text';
import { Quad } from '../../components/Quad/Quad';
import { useTheme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithApple } from '../../lib/apple_signin';
import { useGoogleAuth, extractGoogleIdToken } from '../../lib/google_signin';
import { apiJson } from '../../lib/api';
import { storeTokens } from '../../lib/auth_state';
import { useEffect } from 'react';

const PREVIEW_STATE = {
  mental: 'complete' as const,
  financial: 'complete' as const,
  spiritual: 'in_progress' as const,
  physical: 'empty' as const,
};

export default function WelcomeScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const { response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    const idToken = extractGoogleIdToken(response);
    if (idToken) handleBackendAuth('google', idToken);
  }, [response]);

  async function handleBackendAuth(provider: 'apple' | 'google', idToken: string) {
    setLoading(true);
    try {
      const res = await apiJson<{ accessToken: string; refreshToken: string; isNewUser: boolean; onboardingComplete: boolean }>(
        `/v1/auth/${provider}`,
        { method: 'POST', body: JSON.stringify({ idToken }), skipAuth: true } as Parameters<typeof apiJson>[1]
      );
      await storeTokens(res.accessToken, res.refreshToken);
      if (res.onboardingComplete) {
        router.replace('/(app)/home');
      } else {
        router.push('/(onboarding)/pillars');
      }
    } catch (err) {
      Alert.alert('', 'Try that again. We\'ll wait.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    try {
      const result = await signInWithApple();
      await handleBackendAuth('apple', result.idToken);
    } catch (err: unknown) {
      if ((err as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('', 'Try that again. We\'ll wait.');
      }
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.content}>
        <Quad size={88} state={PREVIEW_STATE} />
        <Text variant="headline" style={styles.title}>4Wins</Text>
        <Text variant="title" style={[styles.tagline, { color: colors.textSecondary }]}>
          {'Discipline isn\'t motivation.\nIt\'s a decision you make once,\nand keep making.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
          cornerRadius={8}
          style={styles.appleButton}
          onPress={handleApple}
        />

        <Pressable
          style={[styles.googleButton, { borderColor: colors.hairline, backgroundColor: colors.surface }]}
          onPress={() => !loading && promptAsync()}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <Text variant="bodyEmphasis" color={colors.text}>Continue with Google</Text>
        </Pressable>

        <Text variant="caption" style={[styles.legal, { color: colors.textTertiary }]}>
          {'By continuing you agree to our '}
          <Text
            variant="caption"
            color={colors.textSecondary}
            onPress={() => WebBrowser.openBrowserAsync('https://4wins.me/terms')}
          >Terms</Text>
          {' and '}
          <Text
            variant="caption"
            color={colors.textSecondary}
            onPress={() => WebBrowser.openBrowserAsync('https://4wins.me/privacy')}
          >Privacy</Text>
          .
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { textAlign: 'center' },
  tagline: { textAlign: 'center', lineHeight: 32 },
  actions: { gap: 12 },
  appleButton: { height: 52, width: '100%' },
  googleButton: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legal: { textAlign: 'center', marginTop: 8 },
});
