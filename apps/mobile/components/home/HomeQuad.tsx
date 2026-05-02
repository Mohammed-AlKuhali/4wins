import React from 'react';
import { useRouter } from 'expo-router';
import { Quad } from '../Quad/Quad';
import type { QuadState, PillarKey } from '../Quad/types';
import type { TodayDay } from '../../hooks/useToday';

const ALL_PILLARS: PillarKey[] = ['mental', 'financial', 'spiritual', 'physical'];

function buildQuadState(day: TodayDay): QuadState {
  const logged = new Set(day.pillarsLogged);
  return {
    mental: logged.has('mental') ? 'complete' : 'empty',
    financial: logged.has('financial') ? 'complete' : 'empty',
    spiritual: logged.has('spiritual') ? 'complete' : 'empty',
    physical: logged.has('physical') ? 'complete' : 'empty',
  };
}

interface HomeQuadProps {
  day: TodayDay;
  size?: number;
}

export function HomeQuad({ day, size = 280 }: HomeQuadProps) {
  const router = useRouter();

  function handleArcPress(pillar: PillarKey) {
    router.push(`/(app)/pillar/${pillar}` as any);
  }

  return (
    <Quad
      size={size}
      state={buildQuadState(day)}
      isRestDay={day.isRestDay}
      onArcPress={handleArcPress}
      closingAnimation={!!day.closedAt}
    />
  );
}
