import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { HomeQuad } from '../../components/home/HomeQuad';
import { EntriesList } from '../../components/home/EntriesList';
import { WeekStrip } from '../../components/home/WeekStrip';
import { CumulativeCount } from '../../components/home/CumulativeCount';
import { DayCompleteOverlay } from '../../components/home/DayCompleteOverlay';
import { useToday, useInvalidateToday } from '../../hooks/useToday';
import { useTheme } from '../../theme';

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: today, isLoading, refetch } = useToday();
  const invalidate = useInvalidateToday();
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const isoWeek = getISOWeek(now);
  const weekLabel = `W${isoWeek.split('-W')[1]} · ${now.toLocaleDateString(undefined, { weekday: 'short' })}`;

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  if (isLoading || !today) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  const nextPillar = today.nextPillar;
  const isClosed = !!today.closedAt;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Text variant="caption" color={colors.textSecondary}>{weekLabel}</Text>
        <Pressable
          onPress={() => router.push('/(app)/settings' as any)}
          accessibilityRole="button"
          accessibilityLabel="Settings"
          style={styles.settingsIcon}
        >
          <Text variant="caption" color={colors.textSecondary}>⚙</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quadSection}>
          <HomeQuad day={today} />
          <Text variant="title" style={styles.status}>
            {isClosed ? 'Closed.' : nextPillar ? `Next: ${nextPillar}` : 'Today is open.'}
          </Text>
          {isClosed && (
            <Text variant="caption" color={colors.textSecondary}>Tomorrow opens fresh.</Text>
          )}
        </View>

        <EntriesList entries={today.entries} />

        <WeekStrip
          days={today.entries.length > 0 ? [{ date: today.date, pillarsLogged: today.pillarsLogged, isRestDay: today.isRestDay, isClosed }] : []}
          isoWeek={isoWeek}
          todayDate={today.date}
        />

        <CumulativeCount />
      </ScrollView>

      {isClosed && <DayCompleteOverlay dayId={today.id} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 },
  settingsIcon: { padding: 8 },
  scroll: { paddingHorizontal: 24 },
  quadSection: { alignItems: 'center', paddingTop: 24, gap: 16 },
  status: { textAlign: 'center' },
  skeleton: { flex: 1, opacity: 0 },
});
