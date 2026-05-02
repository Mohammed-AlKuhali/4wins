import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { CenteredPage } from '../../components/CenteredPage';
import { useTheme } from '../../theme';
import { useOnboarding } from '../../lib/onboarding_context';
import { registerPushToken } from '../../lib/push_register';

const OPTIONS = [
  { label: 'Allow, once a day', pref: 1 as const },
  { label: 'Allow, twice a day max', pref: 2 as const },
  { label: 'No notifications', pref: 0 as const },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { setNotifications } = useOnboarding();
  const [loading, setLoading] = useState(false);

  async function handleOption(pref: 0 | 1 | 2) {
    setLoading(true);
    try {
      if (pref > 0) {
        await registerPushToken(pref);
      } else {
        setNotifications(0);
      }
    } catch (err) {
      setNotifications(0);
    } finally {
      setLoading(false);
      router.push('/(onboarding)/day-zero');
    }
  }

  return (
    <CenteredPage>
      <View style={styles.content}>
        <Text variant="headline" style={styles.prompt}>
          {'We send one push a day, anchored to your cue.\nWe never send "don\'t break your streak."'}
        </Text>
        <View style={styles.options}>
          {OPTIONS.map((o) => (
            <Pressable
              key={o.pref}
              style={[styles.option, { borderColor: colors.hairline, backgroundColor: colors.surface }]}
              onPress={() => !loading && handleOption(o.pref)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={o.label}
            >
              <Text variant="bodyEmphasis">{o.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </CenteredPage>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 32 },
  prompt: {},
  options: { gap: 12 },
  option: { height: 52, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
});
