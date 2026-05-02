import React from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PillarCaptureShell } from './PillarCaptureShell';
import { useInvalidateToday } from '../../hooks/useToday';
import { getSpiritualPrompt } from '../../lib/spiritual_prompts';
import { apiJson } from '../../lib/api';
import { useMutation } from '@tanstack/react-query';
import type { User } from '../../hooks/useAuth';

interface Props {
  user: User | null;
}

export function Spiritual({ user }: Props) {
  const router = useRouter();
  const invalidateToday = useInvalidateToday();
  const prompt = getSpiritualPrompt(user?.tradition ?? null, user?.customTraditionText ?? null);

  const mutation = useMutation({
    mutationFn: (body: object) => apiJson('/v1/entries', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { invalidateToday(); router.back(); },
    onError: () => Alert.alert('', "Try that again. We'll wait."),
  });

  return (
    <PillarCaptureShell
      prompt={prompt}
      pillar="spiritual"
      onLazyPath={() => mutation.mutate({ pillar: 'spiritual', input_method: 'lazy_path' })}
      onVoice={() => router.push('/(modals)/voice' as any)}
      lazyLabel="Log a tiny Spiritual win"
      loading={mutation.isPending}
    />
  );
}
