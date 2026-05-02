import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../Text';
import { PillarGlyph } from '../PillarGlyph/PillarGlyph';
import { useTheme } from '../../theme';
import type { TodayEntry } from '../../hooks/useToday';

interface EntriesListProps {
  entries: TodayEntry[];
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

export function EntriesList({ entries }: EntriesListProps) {
  const { colors } = useTheme();
  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>Today</Text>
      {entries.map((e) => (
        <View key={e.id} style={[styles.row, { borderBottomColor: colors.hairline }]}>
          <PillarGlyph pillar={e.pillar as any} size={20} color={colors.textSecondary} />
          <View style={styles.content}>
            <Text variant="body" numberOfLines={1}>{e.rawText ?? `${e.pillar} win logged`}</Text>
            <Text variant="caption" color={colors.textTertiary}>{formatTime(e.createdAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  sectionLabel: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  content: { flex: 1 },
});
