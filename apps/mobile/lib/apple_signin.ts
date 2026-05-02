import * as AppleAuthentication from 'expo-apple-authentication';

export interface AppleSignInResult {
  idToken: string;
  fullName?: { givenName?: string | null; familyName?: string | null } | null;
  email?: string | null;
}

export async function signInWithApple(): Promise<AppleSignInResult> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('No identity token from Apple');
  }

  return {
    idToken: credential.identityToken,
    fullName: credential.fullName,
    email: credential.email,
  };
}
