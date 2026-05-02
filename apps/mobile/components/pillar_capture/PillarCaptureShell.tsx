import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../Text';
import { useTheme } from '../../theme';

interface PillarCaptureShellProps {
  prompt: string;
  pillar: string;
  onLazyPath?: () => void;
  onTypeInput?: () => void;
  onVoice?: () => void;
  lazyLabel?: string;
  children?: React.ReactNode;
  loading?: boolean;
}

export function PillarCaptureShell({
  prompt,
  pillar,
  onLazyPath,
  onTypeInput,
  onVoice,
  lazyLabel,
  children,
  loading,
}: PillarCaptureShellProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <Pressable
        style={styles.close}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Text variant="caption" color={colors.textSecondary}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <Text variant="display" style={styles.prompt}>{prompt}</Text>
        {children}
      </View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + 32 }]}>
        {onVoice && (
          <Pressable
            style={[styles.micButton, { backgroundColor: colors.surface, borderColor: colors.hairline }]}
            onPress={onVoice}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Record voice note"
          >
            <Text variant="numericInline" color={colors.text}>●</Text>
          </Pressable>
        )}

        {onLazyPath && (
          <Pressable
            style={[styles.lazyButton, { borderColor: colors.hairline }]}
            onPress={onLazyPath}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={lazyLabel ?? `Log a tiny ${pillar} win`}
          >
            <Text variant="caption" color={colors.textSecondary}>{lazyLabel ?? `Log a tiny ${pillar} win`}</Text>
          </Pressable>
        )}

        {onTypeInput && (
          <Pressable
            onPress={onTypeInput}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Type instead"
          >
            <Text variant="caption" color={colors.textTertiary}>Type instead</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  close: { paddingVertical: 16, alignSelf: 'flex-start' },
  content: { flex: 1, justifyContent: 'center', gap: 24 },
  prompt: { textAlign: 'center' },
  actions: { alignItems: 'center', gap: 16, paddingTop: 24 },
  micButton: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lazyButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
});
