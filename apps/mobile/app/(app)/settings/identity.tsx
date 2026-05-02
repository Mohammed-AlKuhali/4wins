import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { useTheme } from '../../../theme';
import { apiJson } from '../../../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function IdentitySettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [text, setText] = useState('');

  const mutation = useMutation({
    mutationFn: (s: string) => apiJson('/v1/me', { method: 'PATCH', body: JSON.stringify({ identity_statement: s }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }); router.back(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 16 }]}>
      <Text variant="caption" color={colors.textSecondary} onPress={() => router.back()} style={styles.back}>← Back</Text>
      <Text variant="title" style={styles.heading}>Who are you becoming?</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.hairline, color: colors.text }]}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={1000}
        placeholder="I am someone who..."
        placeholderTextColor={colors.textTertiary}
        autoFocus
      />
      <Pressable
        style={[styles.cta, { backgroundColor: text.length >= 10 ? colors.text : colors.surface }]}
        onPress={() => mutation.mutate(text)}
        disabled={text.length < 10 || mutation.isPending}
        accessibilityRole="button"
        accessibilityLabel="Save"
      >
        <Text variant="bodyEmphasis" color={text.length >= 10 ? colors.bg : colors.textTertiary}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, gap: 16 },
  back: { marginBottom: 8 },
  heading: {},
  input: { borderWidth: 1, borderRadius: 8, padding: 16, minHeight: 96, fontSize: 17 },
  cta: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
