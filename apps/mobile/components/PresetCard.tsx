import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme';

interface PresetCardProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export function PresetCard({ label, onPress, disabled, selected }: PresetCardProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[
        styles.card,
        { borderColor: colors.hairline, backgroundColor: selected ? colors.text : colors.surface },
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text variant="body" color={selected ? colors.bg : colors.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { height: 56, borderRadius: 8, borderWidth: 1, paddingHorizontal: 16, justifyContent: 'center', marginBottom: 12 },
});
