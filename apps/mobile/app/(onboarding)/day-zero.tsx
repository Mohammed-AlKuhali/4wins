import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../../components/Text';
import { Quad } from '../../components/Quad/Quad';
import type { QuadState, PillarKey } from '../../components/Quad/types';
import { useTheme } from '../../theme';
import { useOnboarding } from '../../lib/onboarding_context';
import { apiJson } from '../../lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const PILLAR_ORDER: PillarKey[] = ['mental', 'financial', 'spiritual', 'physical'];
const STORAGE_KEY = 'dayZeroPillarIndex';

const PROMPTS: Record<PillarKey, string> = {
  mental: "What's one thing you'd like to learn?",
  financial: "Did your money behavior today\nmatch the person you're becoming?",
  spiritual: 'spiritual',
  physical: 'Move your body. One minute counts.',
};

const TRADITION_PROMPTS: Record<string, string> = {
  christian: 'What are you grateful to God for today?',
  stoic: "What's in your control today, and what isn't?",
  buddhist: 'What did you notice without attaching to it?',
  secular: "What matters today beyond what's urgent?",
  custom: "What matters today beyond what's urgent?",
};

const FINANCIAL_OPTIONS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Not quite', value: 'not_quite' },
  { label: 'Not today', value: 'not_today' },
];

const EMPTY_STATE: QuadState = {
  mental: 'empty',
  financial: 'empty',
  spiritual: 'empty',
  physical: 'empty',
};

export default function DayZeroScreen() {
  const { colors } = useTheme();
  const { state: obState, advancePillar, completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [pillarIndex, setPillarIndex] = useState(obState.dayZeroPillarIndex);
  const [quadState, setQuadState] = useState<QuadState>(EMPTY_STATE);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((v) => {
      if (v) setPillarIndex(parseInt(v, 10));
    });
  }, []);

  const currentPillar: PillarKey | null = pillarIndex < PILLAR_ORDER.length ? PILLAR_ORDER[pillarIndex] : null;

  function getPrompt(): string {
    if (!currentPillar) return '';
    if (currentPillar === 'spiritual') {
      return TRADITION_PROMPTS[obState.tradition ?? 'secular'] ?? TRADITION_PROMPTS.secular;
    }
    return PROMPTS[currentPillar];
  }

  async function logEntry(body: object) {
    setLoading(true);
    try {
      await apiJson('/v1/entries', { method: 'POST', body: JSON.stringify(body) });
      const nextIndex = pillarIndex + 1;
      const newPillar = currentPillar!;
      setQuadState((s) => ({ ...s, [newPillar]: 'complete' }));
      await SecureStore.setItemAsync(STORAGE_KEY, String(nextIndex));
      advancePillar();

      if (nextIndex >= PILLAR_ORDER.length) {
        setClosing(true);
        completeOnboarding();
        setTimeout(() => router.replace('/(onboarding)/first-close'), 2400);
      } else {
        setPillarIndex(nextIndex);
      }
    } catch {
      Alert.alert('', "Try that again. We'll wait.");
    } finally {
      setLoading(false);
    }
  }

  function handleLazy() {
    if (!currentPillar || loading) return;
    logEntry({ pillar: currentPillar, input_method: 'lazy_path' });
  }

  function handleFinancial(value: string) {
    if (loading) return;
    logEntry({ pillar: 'financial', input_method: 'type', structured_data: { behavior_match: value } });
  }

  if (!currentPillar) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.quadArea}>
        <Quad size={240} state={quadState} closingAnimation={closing} />
      </View>

      <View style={styles.promptArea}>
        <Text variant="title" style={[styles.prompt, { color: colors.text }]}>{getPrompt()}</Text>
      </View>

      <View style={styles.actionArea}>
        {currentPillar === 'financial' ? (
          FINANCIAL_OPTIONS.map((o) => (
            <Pressable
              key={o.value}
              style={[styles.bigButton, { backgroundColor: colors.surface, borderColor: colors.hairline }]}
              onPress={() => handleFinancial(o.value)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={o.label}
            >
              <Text variant="bodyEmphasis">{o.label}</Text>
            </Pressable>
          ))
        ) : (
          <Pressable
            style={[styles.bigButton, { backgroundColor: colors.text }]}
            onPress={handleLazy}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={`Log a tiny ${currentPillar} win`}
          >
            <Text variant="bodyEmphasis" color={colors.bg}>Log a tiny {currentPillar} win</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24 },
  quadArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  promptArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionArea: { gap: 12 },
  bigButton: { height: 60, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  prompt: { textAlign: 'center' },
});
