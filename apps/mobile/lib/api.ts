import { ENV } from './env';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from './auth_state';

let onSignOut: (() => void) | null = null;

export function registerSignOutHandler(handler: () => void) {
  onSignOut = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${ENV.API_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { accessToken: string; refreshToken: string };
    await storeTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(path: string, options: ApiOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  const url = `${ENV.API_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (!skipAuth) {
    const access = await getAccessToken();
    if (access) headers['Authorization'] = `Bearer ${access}`;
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuth) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      await clearTokens();
      onSignOut?.();
      throw new Error('Session expired');
    }
    headers['Authorization'] = `Bearer ${newAccess}`;
    return fetch(url, { ...fetchOptions, headers });
  }

  return res;
}

export async function apiJson<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}
