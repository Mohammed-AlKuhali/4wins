import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { useTheme } from '../../theme';
import { apiJson } from '../../lib/api';
import { markPaywallShown } from '../../lib/paywall_state';
import { useMutation, useQuery } from '@tanstack/react-query';

interface InsightCard {
  type: string;
  title: string;
  summary: string;
  paywalled: boolean;
}

export default function PaywallModal() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => { markPaywallShown(); }, []);

  const { data: insights = [] } = useQuery<InsightCard[]>({
    queryKey: ['insights'],
    queryFn: () => apiJson<InsightCard[]>('/v1/insights'),
  });

  const trialMutation = useMutation({
    mutationFn: () => apiJson('/v1/subscription/start_trial', { method: 'POST' }),
    onSuccess: () => { router.back(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  function handleContinueFree() {
    router.back();
  }

  const displayCards: InsightCard[] = [
    ...(insights.slice(0, 2)),
    { type: 'cross_pillar', title: 'Cross-pillar correlation', summary: 'Unlock to see how your pillars connect.', paywalled: true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <Pressable style={styles.close} onPress={handleContinueFree} accessibilityRole="button" accessibilityLabel="Close">
        <Text variant="caption" color={colors.textSecondary}>✕</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="headline" style={styles.heading}>This is your first month.</Text>
        <Text variant="body" color={colors.textSecondary} style={styles.sub}>
          {"Here's what 30 days of you\nlooks like."}
        </Text>

        {displayCards.map((card, i) => (
          <View
            key={i}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.hairline },
              card.paywalled && styles.paywalled,
            ]}
          >
            <Text variant="bodyEmphasis">{card.title}</Text>
            {card.paywalled ? (
              <Text variant="caption" color={colors.textTertiary}>Unlock with trial to see this insight.</Text>
            ) : (
              <Text variant="body" color={colors.textSecondary}>{card.summary}</Text>
            )}
          </View>
        ))}

        <Text variant="caption" color={colors.textSecondary} style={styles.price}>
          {'$79 a year. No card needed for the trial.'}
        </Text>
      </ScrollView>

      <View style={styles.ctas}>
        <Pressable
          style={[styles.primaryCta, { backgroundColor: colors.text }]}
          onPress={() => trialMutation.mutate()}
          disabled={trialMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Start 14-day trial"
        >
          <Text variant="bodyEmphasis" color={colors.bg}>Start 14-day trial</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryCta}
          onPress={handleContinueFree}
          accessibilityRole="button"
          accessibilityLabel="Continue free, 30-day history"
        >
          <Text variant="body" color={colors.textSecondary}>Continue free, 30-day history</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  close: { alignSelf: 'flex-end', padding: 8 },
  content: { gap: 16, paddingTop: 8, paddingBottom: 24 },
  heading: {},
  sub: {},
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  paywalled: { opacity: 0.6 },
  price: { textAlign: 'center', marginTop: 8 },
  ctas: { gap: 12 },
  primaryCta: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryCta: { height: 44, alignItems: 'center', justifyContent: 'center' },
});
