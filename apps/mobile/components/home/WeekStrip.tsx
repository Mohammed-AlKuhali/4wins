import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MiniQuad } from '../Quad/MiniQuad';
import { Text } from '../Text';
import { useTheme } from '../../theme';
import type { QuadState } from '../Quad/types';

interface WeekDay {
  date: string;
  pillarsLogged: string[];
  isRestDay: boolean;
  isClosed: boolean;
}

interface WeekStripProps {
  days: WeekDay[];
  isoWeek: string;
  todayDate: string;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function dayState(d: WeekDay): QuadState {
  const l = new Set(d.pillarsLogged);
  return {
    mental: l.has('mental') ? 'complete' : 'empty',
    financial: l.has('financial') ? 'complete' : 'empty',
    spiritual: l.has('spiritual') ? 'complete' : 'empty',
    physical: l.has('physical') ? 'complete' : 'empty',
  };
}

export function WeekStrip({ days, isoWeek, todayDate }: WeekStripProps) {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary} style={styles.label}>This week</Text>
      <View style={styles.row}>
        {days.map((d, i) => (
          <Pressable
            key={d.date}
            style={styles.cell}
            onPress={() => router.push(`/(app)/weekly/${isoWeek}` as any)}
            accessibilityRole="button"
            accessibilityLabel={`Week day ${i + 1}`}
          >
            <MiniQuad size={36} state={dayState(d)} isRestDay={d.isRestDay} />
            <Text
              variant="caption"
              color={d.date === todayDate ? colors.text : colors.textTertiary}
              style={styles.dayLabel}
            >
              {DAY_LABELS[i]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 32 },
  label: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { alignItems: 'center', gap: 4 },
  dayLabel: { fontSize: 11 },
});
