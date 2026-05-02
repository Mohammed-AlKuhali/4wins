import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../theme';

interface SettingRowProps {
  title: string;
  value?: string;
  onPress?: () => void;
  hasChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

export function SettingRow({ title, value, onPress, hasChevron = false, destructive = false, disabled }: SettingRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.hairline }]}
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={title}
    >
      <Text variant="body" color={destructive ? '#A04428' : colors.text}>{title}</Text>
      <View style={styles.right}>
        {value && <Text variant="body" color={colors.textSecondary}>{value}</Text>}
        {hasChevron && <Text variant="caption" color={colors.textTertiary}>›</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
