import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { PresetCard } from '../../../components/PresetCard';
import { useTheme } from '../../../theme';
import { apiJson } from '../../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tradition } from '../../../lib/onboarding_context';

const OPTIONS: { key: Tradition; label: string }[] = [
  { key: 'christian', label: 'Christian' },
  { key: 'stoic', label: 'Stoic' },
  { key: 'buddhist', label: 'Buddhist' },
  { key: 'secular', label: 'Secular' },
  { key: 'custom', label: 'Custom' },
];

export default function TraditionSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (tradition: Tradition) => apiJson('/v1/me', { method: 'PATCH', body: JSON.stringify({ tradition }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); router.back(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16 }]}>
      <Text variant="caption" color={colors.textSecondary} onPress={() => router.back()} style={styles.back}>← Back</Text>
      <Text variant="title" style={styles.heading}>Tradition</Text>
      {OPTIONS.map((o) => <PresetCard key={o.key} label={o.label} onPress={() => mutation.mutate(o.key)} disabled={mutation.isPending} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  back: { marginBottom: 24 },
  heading: { marginBottom: 24 },
});
