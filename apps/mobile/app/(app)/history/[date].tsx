import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../../components/Text';
import { Quad } from '../../../components/Quad/Quad';
import { PillarGlyph } from '../../../components/PillarGlyph/PillarGlyph';
import { useTheme } from '../../../theme';
import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../../../lib/api';
import type { QuadState } from '../../../components/Quad/types';
import type { TodayDay } from '../../../hooks/useToday';

function dayState(pillarsLogged: string[]): QuadState {
  const l = new Set(pillarsLogged);
  return {
    mental: l.has('mental') ? 'complete' : 'empty',
    financial: l.has('financial') ? 'complete' : 'empty',
    spiritual: l.has('spiritual') ? 'complete' : 'empty',
    physical: l.has('physical') ? 'complete' : 'empty',
  };
}

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: day } = useQuery<TodayDay>({
    queryKey: ['day', date],
    queryFn: () => apiJson<TodayDay>(`/v1/entries?date=${date}`),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back">
          <Text variant="caption" color={colors.textSecondary}>← Back</Text>
        </Pressable>
        <Text variant="caption" color={colors.textSecondary}>{date}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        {day && (
          <>
            <View style={styles.quadSection}>
              <Quad size={200} state={dayState(day.pillarsLogged)} isRestDay={day.isRestDay} />
            </View>
            {day.entries.map((e) => (
              <View key={e.id} style={[styles.entry, { borderBottomColor: colors.hairline }]}>
                <PillarGlyph pillar={e.pillar as any} size={20} color={colors.textSecondary} />
                <View style={styles.entryContent}>
                  <Text variant="body" numberOfLines={3}>{e.rawText ?? `${e.pillar} win`}</Text>
                  <Text variant="caption" color={colors.textTertiary}>
                    {new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(e.createdAt))}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  content: { paddingHorizontal: 24 },
  quadSection: { alignItems: 'center', paddingVertical: 32 },
  entry: { flexDirection: 'row', gap: 12, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  entryContent: { flex: 1 },
});
