import { palette } from '../theme/colors';
import type { PillarKey } from '../components/Quad/types';

export function usePillarColor(pillar: PillarKey): string {
  return palette.pillars[pillar];
}
