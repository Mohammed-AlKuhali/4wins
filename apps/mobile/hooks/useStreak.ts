import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../lib/api';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysComplete: number;
  freezesRemaining: number;
}

export function useStreak() {
  return useQuery<StreakData>({
    queryKey: ['streak'],
    queryFn: () => apiJson<StreakData>('/v1/streak'),
    staleTime: 60_000,
  });
}
