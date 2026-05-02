import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '../lib/api';

interface RestDayState {
  isRestDay: boolean;
  remainingThisMonth: number;
}

export function useRestDay() {
  return useQuery<RestDayState>({
    queryKey: ['rest_day'],
    queryFn: () => apiJson<RestDayState>('/v1/today/rest_day'),
    staleTime: 60_000,
  });
}

export function useToggleRestDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiJson('/v1/today/rest_day', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['today'] });
      qc.invalidateQueries({ queryKey: ['rest_day'] });
    },
  });
}
