import React, { useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { MiniQuad } from '../../components/Quad/MiniQuad';
import { useTheme } from '../../theme';
import { useHistory } from '../../hooks/useHistory';
import type { QuadState } from '../../components/Quad/types';
import { useStreak } from '../../hooks/useStreak';

function dayState(pillarsLogged: string[]): QuadState {
  const l = new Set(pillarsLogged);
  return {
    mental: l.has('mental') ? 'complete' : 'empty',
    financial: l.has('financial') ? 'complete' : 'empty',
    spiritual: l.has('spiritual') ? 'complete' : 'empty',
    physical: l.has('physical') ? 'complete' : 'empty',
  };
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: streak } = useStreak();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const toStr = today.toISOString().slice(0, 10);
  const fromStr = thirtyDaysAgo.toISOString().slice(0, 10);
  const { data: days = [] } = useHistory(fromStr, toStr);

  const isSubscribed = streak?.totalDaysComplete !== undefined;

  function handleDayPress(date: string, isPast: boolean) {
    if (isPast && !isSubscribed) {
      router.push('/(modals)/paywall' as any);
    } else {
      router.push(`/(app)/history/${date}` as any);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text variant="caption" color={colors.textSecondary}>← Back</Text>
        </Pressable>
        <Text variant="title">History</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={days}
        keyExtractor={(d) => d.date}
        numColumns={7}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isPast = item.date < fromStr;
          return (
            <Pressable
              style={styles.cell}
              onPress={() => handleDayPress(item.date, isPast)}
              accessibilityRole="button"
              accessibilityLabel={item.date}
            >
              <MiniQuad size={36} state={dayState(item.pillarsLogged)} isRestDay={item.isRestDay} />
              <Text variant="caption" color={colors.textTertiary} style={styles.dateLabel}>
                {item.date.slice(8)}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  grid: { paddingHorizontal: 16 },
  cell: { flex: 1, alignItems: 'center', padding: 4, gap: 2 },
  dateLabel: { fontSize: 10 },
});
