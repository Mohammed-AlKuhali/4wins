import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { MiniQuad } from '../../../components/Quad/MiniQuad';
import { useTheme } from '../../../theme';
import { useWeek } from '../../../hooks/useWeek';
import { useStreak } from '../../../hooks/useStreak';
import type { QuadState } from '../../../components/Quad/types';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dayState(pillarsLogged: string[]): QuadState {
  const l = new Set(pillarsLogged);
  return {
    mental: l.has('mental') ? 'complete' : 'empty',
    financial: l.has('financial') ? 'complete' : 'empty',
    spiritual: l.has('spiritual') ? 'complete' : 'empty',
    physical: l.has('physical') ? 'complete' : 'empty',
  };
}

export default function WeeklyScreen() {
  const { isoWeek } = useLocalSearchParams<{ isoWeek: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: week } = useWeek(isoWeek);
  const { data: streak } = useStreak();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text variant="caption" color={colors.textSecondary}>← Back</Text>
        </Pressable>
        <Text variant="caption" color={colors.textSecondary}>{isoWeek}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Text variant="headline" style={styles.headline}>The week closed.</Text>
        {week && (
          <Text variant="body" color={colors.textSecondary}>
            {week.daysComplete} of 7 days complete.
          </Text>
        )}

        {week && (
          <View style={styles.weekRow}>
            {week.days.map((d, i) => (
              <View key={d.date} style={styles.dayCell}>
                <MiniQuad size={40} state={dayState(d.pillarsLogged)} isRestDay={d.isRestDay} />
                <Text variant="caption" color={colors.textTertiary} style={styles.dayLabel}>
                  {DAY_LABELS[i]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {streak && (
          <View style={styles.cumulativeRow}>
            <Text variant="numericLarge">{streak.totalDaysComplete}</Text>
            <Text variant="caption" color={colors.textSecondary}>days complete</Text>
          </View>
        )}

        <Pressable
          style={[styles.cta, { backgroundColor: colors.text, marginTop: 'auto' }]}
          onPress={() => router.replace('/(app)/home' as any)}
          accessibilityRole="button"
          accessibilityLabel="Continue"
        >
          <Text variant="bodyEmphasis" color={colors.bg}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  content: { flex: 1, paddingHorizontal: 24, gap: 32 },
  headline: {},
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 11 },
  cumulativeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  cta: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
