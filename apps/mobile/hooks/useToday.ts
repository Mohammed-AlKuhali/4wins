import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../lib/api';

export interface TodayEntry {
  id: string;
  pillar: string;
  rawText: string | null;
  inputMethod: string;
  createdAt: string;
}

export interface TodayDay {
  id: string;
  date: string;
  closedAt: string | null;
  isRestDay: boolean;
  entries: TodayEntry[];
  pillarsLogged: string[];
  nextPillar: string | null;
}

export function useToday() {
  return useQuery<TodayDay>({
    queryKey: ['today'],
    queryFn: () => apiJson<TodayDay>('/v1/today'),
    staleTime: 15_000,
  });
}

export function useInvalidateToday() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['today'] });
}
