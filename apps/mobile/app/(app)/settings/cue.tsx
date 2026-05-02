import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { PresetCard } from '../../../components/PresetCard';
import { useTheme } from '../../../theme';
import { apiJson } from '../../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const PRESETS = [
  { label: 'After my morning coffee', tod: 'morning', time: '07:30' },
  { label: 'Before my laptop', tod: 'morning', time: '08:00' },
  { label: 'When I close my laptop', tod: 'evening', time: '18:00' },
  { label: 'Before bed', tod: 'before_bed', time: '21:30' },
];

export default function CueSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (p: typeof PRESETS[0]) =>
      apiJson('/v1/me', { method: 'PATCH', body: JSON.stringify({ cue_label: p.label, cue_time_of_day: p.tod, cue_time_local: p.time }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); router.back(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16 }]}>
      <Text variant="caption" color={colors.textSecondary} onPress={() => router.back()} style={styles.back}>← Back</Text>
      <Text variant="title" style={styles.heading}>Cue</Text>
      {PRESETS.map((p) => <PresetCard key={p.label} label={p.label} onPress={() => mutation.mutate(p)} disabled={mutation.isPending} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  back: { marginBottom: 24 },
  heading: { marginBottom: 24 },
});
