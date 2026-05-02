import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { Quad } from '../../components/Quad/Quad';
import { useTheme } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FULL_STATE = {
  mental: 'complete' as const,
  financial: 'complete' as const,
  spiritual: 'complete' as const,
  physical: 'complete' as const,
};

export default function FirstCloseScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.content}>
        <Quad size={240} state={FULL_STATE} />
        <Text variant="display" style={styles.headline}>You closed your first Quad.</Text>
      </View>
      <Pressable
        style={[styles.cta, { backgroundColor: colors.text }]}
        onPress={() => router.replace('/(app)/home')}
        accessibilityRole="button"
        accessibilityLabel="Continue"
      >
        <Text variant="bodyEmphasis" color={colors.bg}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40 },
  headline: { textAlign: 'center' },
  cta: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
