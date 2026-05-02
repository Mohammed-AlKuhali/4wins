import { useMemo } from 'react';
import type { QuadState, PillarState } from '../components/Quad/types';
import type { TodayDay } from './useToday';

export function useQuadState(day: TodayDay | undefined): QuadState {
  return useMemo(() => {
    if (!day) {
      return { mental: 'empty', financial: 'empty', spiritual: 'empty', physical: 'empty' };
    }
    const logged = new Set(day.pillarsLogged);
    const toState = (p: string): PillarState => logged.has(p) ? 'complete' : 'empty';
    return {
      mental: toState('mental'),
      financial: toState('financial'),
      spiritual: toState('spiritual'),
      physical: toState('physical'),
    };
  }, [day]);
}
