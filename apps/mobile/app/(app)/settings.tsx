import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { SettingRow } from '../../components/settings/SettingRow';
import { Section } from '../../components/settings/Section';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { apiJson } from '../../lib/api';
import { clearTokens } from '../../lib/auth_state';
import * as SecureStore from 'expo-secure-store';
import type { AppearanceOverride } from '../../theme/ThemeProvider';

const APPEARANCE_OPTIONS: AppearanceOverride[] = ['auto', 'dark', 'light'];
const APPEARANCE_LABELS: Record<AppearanceOverride, string> = { auto: 'Auto', dark: 'Dark', light: 'Light' };

export default function SettingsScreen() {
  const { colors, setAppearanceOverride, appearanceOverride } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  function handleSubscription() {
    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';
    Linking.openURL(url);
  }

  function handleSignOut() {
    Alert.alert('Sign out?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        onPress: async () => {
          await signOut();
          router.replace('/(onboarding)/welcome' as any);
        },
      },
    ]);
  }

  function handleDelete() {
    Alert.alert(
      'Delete your account?',
      'Data is recoverable for 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiJson('/v1/me', { method: 'DELETE' });
              await clearTokens();
              router.replace('/(onboarding)/welcome' as any);
            } catch {
              Alert.alert('', "Try that again. We'll wait.");
            }
          },
        },
      ],
    );
  }

  function cycleAppearance() {
    const idx = APPEARANCE_OPTIONS.indexOf(appearanceOverride);
    const next = APPEARANCE_OPTIONS[(idx + 1) % APPEARANCE_OPTIONS.length];
    setAppearanceOverride(next);
    SecureStore.setItemAsync('appearanceOverride', next);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text
          variant="caption"
          color={colors.textSecondary}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >← Back</Text>
        <Text variant="title">Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 48 }]}>
        <Section title="Practice">
          <SettingRow title="Tradition" value={user?.tradition ?? undefined} onPress={() => router.push('/(app)/settings/tradition' as any)} hasChevron />
          {user?.tradition === 'custom' && (
            <SettingRow title="Custom prompt" onPress={() => router.push('/(app)/settings/custom-tradition' as any)} hasChevron />
          )}
          <SettingRow title="Cue" value={user?.cueLabel ?? undefined} onPress={() => router.push('/(app)/settings/cue' as any)} hasChevron />
          <SettingRow title="Identity" onPress={() => router.push('/(app)/settings/identity' as any)} hasChevron />
        </Section>

        <Section title="Appearance">
          <SettingRow title="Mode" value={APPEARANCE_LABELS[appearanceOverride]} onPress={cycleAppearance} />
        </Section>

        <Section title="Subscription">
          <SettingRow title="Subscription" value={user?.subscriptionStatus} onPress={() => router.push('/(modals)/subscription' as any)} hasChevron />
        </Section>

        <Section title="Account">
          <SettingRow title="Sign out" onPress={handleSignOut} />
          <SettingRow title="Delete account" onPress={handleDelete} destructive />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16 },
  scroll: { paddingHorizontal: 24, paddingTop: 24 },
});
