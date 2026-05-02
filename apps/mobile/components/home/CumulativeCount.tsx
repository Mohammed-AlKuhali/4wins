import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import { useStreak } from '../../hooks/useStreak';

export function CumulativeCount() {
  const { colors } = useTheme();
  const { data } = useStreak();
  if (!data) return null;

  return (
    <View style={styles.container}>
      <Text variant="numericLarge">{data.totalDaysComplete}</Text>
      <Text variant="caption" color={colors.textSecondary}>days complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 32, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
});
