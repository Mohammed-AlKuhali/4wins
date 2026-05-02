import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { CenteredPage } from '../../components/CenteredPage';
import { useTheme } from '../../theme';
import { useOnboarding, Tradition } from '../../lib/onboarding_context';
import { apiJson } from '../../lib/api';
import { useMutation } from '@tanstack/react-query';

const OPTIONS: { key: Tradition; label: string }[] = [
  { key: 'christian', label: 'Christian' },
  { key: 'stoic', label: 'Stoic' },
  { key: 'buddhist', label: 'Buddhist' },
  { key: 'secular', label: 'Secular' },
  { key: 'custom', label: 'Custom' },
];

export default function TraditionScreen() {
  const { colors } = useTheme();
  const { setTradition } = useOnboarding();
  const [selected, setSelected] = useState<Tradition | null>(null);
  const [customText, setCustomText] = useState('');

  const mutation = useMutation({
    mutationFn: async ({ tradition, customTraditionText }: { tradition: Tradition; customTraditionText?: string }) => {
      return apiJson('/v1/me', {
        method: 'PATCH',
        body: JSON.stringify({ tradition, custom_tradition_text: customTraditionText }),
      });
    },
    onSuccess: (_data, vars) => {
      setTradition(vars.tradition, vars.customTraditionText);
      router.push('/(onboarding)/identity');
    },
    onError: () => {
      Alert.alert('', 'Try that again. We\'ll wait.');
    },
  });

  function handleSelect(key: Tradition) {
    setSelected(key);
    if (key !== 'custom') {
      mutation.mutate({ tradition: key });
    }
  }

  function handleCustomContinue() {
    if (!customText.trim()) return;
    mutation.mutate({ tradition: 'custom', customTraditionText: customText.trim() });
  }

  return (
    <CenteredPage>
      <Text variant="headline" style={styles.prompt}>
        {'Your Spiritual win can draw from a tradition,\nor from your own thinking.'}
      </Text>
      <View style={styles.options}>
        {OPTIONS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[
              styles.option,
              { borderColor: colors.hairline, backgroundColor: selected === key ? colors.text : colors.surface },
            ]}
            onPress={() => handleSelect(key)}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Text variant="bodyEmphasis" color={selected === key ? colors.bg : colors.text}>{label}</Text>
          </Pressable>
        ))}
        {selected === 'custom' && (
          <View>
            <TextInput
              style={[styles.input, { borderColor: colors.hairline, color: colors.text }]}
              placeholder="Name your own."
              placeholderTextColor={colors.textTertiary}
              value={customText}
              onChangeText={setCustomText}
              autoFocus
            />
            <Pressable
              style={[styles.option, { backgroundColor: colors.text, marginTop: 12 }]}
              onPress={handleCustomContinue}
              disabled={!customText.trim() || mutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text variant="bodyEmphasis" color={colors.bg}>Continue</Text>
            </Pressable>
          </View>
        )}
      </View>
    </CenteredPage>
  );
}

const styles = StyleSheet.create({
  prompt: { marginBottom: 32 },
  options: { gap: 12 },
  option: { height: 48, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  input: { height: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, fontSize: 17 },
});
