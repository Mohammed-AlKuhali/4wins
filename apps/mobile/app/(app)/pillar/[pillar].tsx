import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PillarCaptureShell } from '../../../components/pillar_capture/PillarCaptureShell';
import { Financial } from '../../../components/pillar_capture/Financial';
import { Spiritual } from '../../../components/pillar_capture/Spiritual';
import { useAuth } from '../../../hooks/useAuth';
import { apiJson } from '../../../lib/api';
import { useInvalidateToday } from '../../../hooks/useToday';
import { useMutation } from '@tanstack/react-query';

const VALID_PILLARS = ['mental', 'financial', 'spiritual', 'physical'] as const;
type ValidPillar = typeof VALID_PILLARS[number];

const PROMPTS: Record<ValidPillar, string> = {
  mental: 'What did you learn today?',
  financial: "Did your money behavior today\nmatch the person you're becoming?",
  spiritual: '',
  physical: 'Move your body. One minute counts.',
};

export default function PillarScreen() {
  const { pillar } = useLocalSearchParams<{ pillar: string }>();
  const router = useRouter();
  const invalidateToday = useInvalidateToday();
  const { user } = useAuth();

  if (!VALID_PILLARS.includes(pillar as ValidPillar)) {
    router.replace('/(app)/home' as any);
    return null;
  }

  const validPillar = pillar as ValidPillar;

  if (validPillar === 'financial') return <Financial />;
  if (validPillar === 'spiritual') return <Spiritual user={user} />;

  const mutation = useMutation({
    mutationFn: (body: object) => apiJson('/v1/entries', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { invalidateToday(); router.back(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  return (
    <PillarCaptureShell
      prompt={PROMPTS[validPillar]}
      pillar={validPillar}
      onLazyPath={() => mutation.mutate({ pillar: validPillar, input_method: 'lazy_path' })}
      onVoice={() => router.push('/(modals)/voice' as any)}
      loading={mutation.isPending}
    />
  );
}
