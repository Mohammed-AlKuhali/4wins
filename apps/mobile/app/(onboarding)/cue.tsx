import React, { useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { CenteredPage } from '../../components/CenteredPage';
import { useTheme } from '../../theme';
import { useOnboarding, CueTimeOfDay } from '../../lib/onboarding_context';
import { apiJson } from '../../lib/api';
import { useMutation } from '@tanstack/react-query';
import { PresetCard } from '../../components/PresetCard';

const PRESETS: { label: string; tod: CueTimeOfDay; time: string }[] = [
  { label: 'After my morning coffee', tod: 'morning', time: '07:30' },
  { label: 'Before my laptop', tod: 'morning', time: '08:00' },
  { label: 'When I close my laptop', tod: 'evening', time: '18:00' },
  { label: 'Before bed', tod: 'before_bed', time: '21:30' },
];

export default function CueScreen() {
  const { colors } = useTheme();
  const { setCue } = useOnboarding();
  const [showPicker, setShowPicker] = useState(false);
  const [customTime, setCustomTime] = useState(new Date());

  const mutation = useMutation({
    mutationFn: async (args: { label: string; tod: CueTimeOfDay; time?: string }) =>
      apiJson('/v1/me', {
        method: 'PATCH',
        body: JSON.stringify({ cue_label: args.label, cue_time_of_day: args.tod, cue_time_local: args.time }),
      }),
    onSuccess: (_data, vars) => {
      setCue(vars.label, vars.tod, vars.time);
      router.push('/(onboarding)/notifications');
    },
    onError: () => Alert.alert('', 'Try that again. We\'ll wait.'),
  });

  function handlePreset(preset: typeof PRESETS[0]) {
    mutation.mutate({ label: preset.label, tod: preset.tod, time: preset.time });
  }

  function handleCustomTime(event: unknown, date?: Date) {
    if (!date) return;
    setCustomTime(date);
    setShowPicker(false);
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    mutation.mutate({ label: 'Custom', tod: 'custom', time: `${hh}:${mm}` });
  }

  return (
    <CenteredPage scrollable>
      <Text variant="headline" style={styles.prompt}>When will you do this?</Text>
      {PRESETS.map((p) => (
        <PresetCard
          key={p.label}
          label={p.label}
          onPress={() => handlePreset(p)}
          disabled={mutation.isPending}
        />
      ))}
      <PresetCard
        label="Custom..."
        onPress={() => setShowPicker(true)}
        disabled={mutation.isPending}
      />
      {showPicker && (
        <DateTimePicker
          value={customTime}
          mode="time"
          is24Hour={false}
          onChange={handleCustomTime}
        />
      )}
    </CenteredPage>
  );
}

const styles = StyleSheet.create({
  prompt: { marginBottom: 24 },
});
