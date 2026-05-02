import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import { apiJson } from '../../lib/api';
import { useInvalidateToday } from '../../hooks/useToday';
import { useMutation } from '@tanstack/react-query';

const OPTIONS = [
  { label: 'Yes', value: 'yes' as const },
  { label: 'Not quite', value: 'not_quite' as const },
  { label: 'Not today', value: 'not_today' as const },
];

export function Financial() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const invalidateToday = useInvalidateToday();
  const [selected, setSelected] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mutation = useMutation({
    mutationFn: (body: object) => apiJson('/v1/entries', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { invalidateToday(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  function handleSelect(value: string) {
    setSelected(value);
    mutation.mutate({ pillar: 'financial', input_method: 'type', structured_data: { behavior_match: value } });
    dismissTimer.current = setTimeout(() => { router.back(); }, 3000);
  }

  function handleContinue() {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    router.back();
  }

  useEffect(() => () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}>
      <Pressable style={styles.close} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close">
        <Text variant="caption" color={colors.textSecondary}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <Text variant="display" style={styles.prompt}>
          {"Did your money behavior today\nmatch the person you're becoming?"}
        </Text>

        {!selected ? (
          <View style={styles.options}>
            {OPTIONS.map((o) => (
              <Pressable
                key={o.value}
                style={[styles.option, { borderColor: colors.hairline, backgroundColor: colors.surface }]}
                onPress={() => handleSelect(o.value)}
                disabled={mutation.isPending}
                accessibilityRole="button"
                accessibilityLabel={o.label}
              >
                <Text variant="bodyEmphasis">{o.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.whyArea}>
            <Text variant="caption" color={colors.textSecondary} style={styles.whyLabel}>Anything to add?</Text>
            <Pressable
              style={[styles.option, { backgroundColor: colors.text, borderColor: colors.text }]}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue"
            >
              <Text variant="bodyEmphasis" color={colors.bg}>Continue</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  close: { paddingVertical: 8, alignSelf: 'flex-start' },
  content: { flex: 1, justifyContent: 'center', gap: 32 },
  prompt: { textAlign: 'center' },
  options: { gap: 12 },
  option: { height: 60, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  whyArea: { gap: 16 },
  whyLabel: { textAlign: 'center' },
});
