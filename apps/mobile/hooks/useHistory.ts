import { useQuery } from '@tanstack/react-query';
import { apiJson } from '../lib/api';

export interface HistoryDay {
  id: string;
  date: string;
  closedAt: string | null;
  isRestDay: boolean;
  pillarsLogged: string[];
}

export function useHistory(from: string, to: string) {
  return useQuery<HistoryDay[]>({
    queryKey: ['history', from, to],
    queryFn: () => apiJson<HistoryDay[]>(`/v1/entries?from=${from}&to=${to}`),
    staleTime: 60_000,
  });
}
