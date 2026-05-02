import React from 'react';
import { View, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { useTheme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../../lib/api';

interface SubStatus {
  status: 'free' | 'trial' | 'paid' | 'expired';
  expiresAt?: string;
  renewsAt?: string;
}

const STORE_URL = Platform.OS === 'ios'
  ? 'https://apps.apple.com/account/subscriptions'
  : 'https://play.google.com/store/account/subscriptions';

const STORE_LABEL = Platform.OS === 'ios' ? 'App Store' : 'Play Store';

export default function SubscriptionModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: sub } = useQuery<SubStatus>({
    queryKey: ['subscription'],
    queryFn: () => apiJson<SubStatus>('/v1/subscription/status'),
  });

  function formatDate(iso?: string) {
    if (!iso) return '';
    return new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  }

  function renderBody() {
    switch (sub?.status) {
      case 'trial':
        return (
          <>
            <Text variant="body">Trial ends {formatDate(sub.expiresAt)}.</Text>
            <Text variant="caption" color={colors.textSecondary}>After that, $79/year via {STORE_LABEL}.</Text>
            <Pressable style={[styles.btn, { borderColor: colors.hairline }]} onPress={() => Linking.openURL(STORE_URL)} accessibilityRole="button" accessibilityLabel={`Manage in ${STORE_LABEL}`}>
              <Text variant="body">Manage in {STORE_LABEL}</Text>
            </Pressable>
          </>
        );
      case 'paid':
        return (
          <>
            <Text variant="body">Paid through {formatDate(sub.renewsAt)}. $79/year.</Text>
            <Pressable style={[styles.btn, { borderColor: colors.hairline }]} onPress={() => Linking.openURL(STORE_URL)} accessibilityRole="button" accessibilityLabel={`Manage in ${STORE_LABEL}`}>
              <Text variant="body">Manage in {STORE_LABEL}</Text>
            </Pressable>
          </>
        );
      case 'expired':
        return (
          <>
            <Text variant="body">Your subscription expired on {formatDate(sub.expiresAt)}.</Text>
            <Pressable style={[styles.btn, { borderColor: colors.hairline }]} onPress={() => Linking.openURL(STORE_URL)} accessibilityRole="button" accessibilityLabel={`Manage in ${STORE_LABEL}`}>
              <Text variant="body">Manage in {STORE_LABEL}</Text>
            </Pressable>
          </>
        );
      default:
        return (
          <>
            <Text variant="body">You're on the free plan. 30 days of history kept.</Text>
            <Pressable style={[styles.btn, { backgroundColor: colors.text }]} onPress={() => router.replace('/(modals)/paywall' as any)} accessibilityRole="button" accessibilityLabel="Start 14-day trial">
              <Text variant="bodyEmphasis" color={colors.bg}>Start 14-day trial</Text>
            </Pressable>
          </>
        );
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <Pressable style={styles.close} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
        <Text variant="caption" color={colors.textSecondary}>✕</Text>
      </Pressable>
      <Text variant="headline" style={styles.heading}>Subscription</Text>
      <View style={styles.body}>
        {renderBody()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  close: { alignSelf: 'flex-end', padding: 8 },
  heading: { marginBottom: 32 },
  body: { gap: 16 },
  btn: { height: 52, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
