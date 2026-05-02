import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Alert } from 'react-native';
import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { CenteredPage } from '../../components/CenteredPage';
import { useTheme } from '../../theme';
import { useOnboarding } from '../../lib/onboarding_context';
import { apiJson } from '../../lib/api';
import { useMutation } from '@tanstack/react-query';

const MIN_CHARS = 10;
const WARN_CHARS = 800;
const MAX_CHARS = 1000;

export default function IdentityScreen() {
  const { colors } = useTheme();
  const { setIdentity } = useOnboarding();
  const [text, setText] = useState('');

  const mutation = useMutation({
    mutationFn: async (identityStatement: string) =>
      apiJson('/v1/me', { method: 'PATCH', body: JSON.stringify({ identity_statement: identityStatement }) }),
    onSuccess: (_data, vars) => {
      setIdentity(vars);
      router.push('/(onboarding)/cue');
    },
    onError: () => Alert.alert('', 'Try that again. We\'ll wait.'),
  });

  const canSubmit = text.trim().length >= MIN_CHARS;

  return (
    <CenteredPage
      footer={
        <Pressable
          style={[styles.cta, { backgroundColor: canSubmit ? colors.text : colors.surface }]}
          onPress={() => mutation.mutate(text.trim())}
          disabled={!canSubmit || mutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text variant="bodyEmphasis" color={canSubmit ? colors.bg : colors.textTertiary}>Continue</Text>
        </Pressable>
      }
    >
      <View style={styles.content}>
        <Text variant="headline" style={styles.prompt}>Who are you becoming?</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.hairline, color: colors.text }]}
          placeholder="I am someone who..."
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={3}
          maxLength={MAX_CHARS}
          autoFocus
        />
        {text.length > WARN_CHARS && (
          <Text variant="caption" color={colors.textSecondary} style={styles.charCount}>
            {text.length}/{MAX_CHARS}
          </Text>
        )}
      </View>
    </CenteredPage>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16 },
  prompt: {},
  input: { borderWidth: 1, borderRadius: 8, padding: 16, fontSize: 17, lineHeight: 24, minHeight: 96 },
  cta: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  charCount: { textAlign: 'right' },
});
