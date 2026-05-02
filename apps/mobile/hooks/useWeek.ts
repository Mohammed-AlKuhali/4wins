import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../lib/api';

export interface WeekSummary {
  isoWeek: string;
  daysComplete: number;
  days: {
    date: string;
    pillarsLogged: string[];
    isRestDay: boolean;
    closedAt: string | null;
  }[];
}

export function useWeek(isoWeek: string) {
  return useQuery<WeekSummary>({
    queryKey: ['week', isoWeek],
    queryFn: () => apiJson<WeekSummary>(`/v1/week/${isoWeek}`),
    staleTime: 60_000,
  });
}
