import { useState, useEffect, useCallback } from 'react';
import { storeTokens, clearTokens } from '../lib/auth_state';
import { apiJson } from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string | null;
  tradition: string | null;
  customTraditionText: string | null;
  identityStatement: string | null;
  cueLabel: string | null;
  cueTimeOfDay: string | null;
  subscriptionStatus: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });
  const queryClient = useQueryClient();

  const loadUser = useCallback(async () => {
    try {
      const user = await apiJson<User>('/v1/me');
      setState({ user, isLoading: false });
    } catch {
      setState({ user: null, isLoading: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(async (provider: 'apple' | 'google', idToken: string) => {
    const res = await apiJson<{ accessToken: string; refreshToken: string }>(`/v1/auth/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    } as Parameters<typeof apiJson>[1]);
    await storeTokens(res.accessToken, res.refreshToken);
    await loadUser();
    return state.user;
  }, [loadUser, state.user]);

  const signOut = useCallback(async () => {
    try {
      await apiJson('/v1/auth/session', { method: 'DELETE' });
    } catch {}
    await clearTokens();
    queryClient.clear();
    setState({ user: null, isLoading: false });
  }, [queryClient]);

  const refresh = useCallback(() => loadUser(), [loadUser]);

  return { ...state, signIn, signOut, refresh };
}
