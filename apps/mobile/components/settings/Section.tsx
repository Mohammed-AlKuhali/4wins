import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../theme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {title && <Text variant="caption" color={colors.textSecondary} style={styles.title}>{title}</Text>}
      <View style={[styles.body, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  title: { marginBottom: 8, paddingHorizontal: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16 },
});
