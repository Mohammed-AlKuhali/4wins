import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { CenteredPage } from '../../components/CenteredPage';
import { useTheme } from '../../theme';

export default function PillarsScreen() {
  const { colors } = useTheme();
  return (
    <CenteredPage
      footer={
        <Pressable
          style={[styles.cta, { backgroundColor: colors.text }]}
          onPress={() => router.push('/(onboarding)/tradition')}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text variant="bodyEmphasis" color={colors.bg}>Continue</Text>
        </Pressable>
      }
    >
      <View style={styles.content}>
        <Text variant="display" style={styles.text}>
          {'Four wins.\nEvery day.'}
        </Text>
        <Text variant="display" style={[styles.text, { marginTop: 24 }]}>
          {'Mental.\nFinancial.\nSpirituel.\nPhysical.'}
        </Text>
        <Text variant="display" style={[styles.text, { marginTop: 24 }]}>
          {'Tomorrow,\nall four again.'}
        </Text>
      </View>
    </CenteredPage>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center' },
  text: { lineHeight: 52 },
  cta: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
