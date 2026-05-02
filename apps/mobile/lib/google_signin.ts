import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInResult {
  idToken: string;
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });

  return { request, response, promptAsync };
}

export function extractGoogleIdToken(response: AuthSession.AuthSessionResult | null): string | null {
  if (response?.type !== 'success') return null;
  return (response.params as Record<string, string>)?.id_token ?? null;
}
