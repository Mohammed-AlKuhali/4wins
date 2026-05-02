import * as SecureStore from 'expo-secure-store';

const PAYWALL_SHOWN_KEY = 'paywallShown';

export async function hasPaywallBeenShown(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(PAYWALL_SHOWN_KEY);
  return v === '1';
}

export async function markPaywallShown(): Promise<void> {
  await SecureStore.setItemAsync(PAYWALL_SHOWN_KEY, '1');
}

export async function clearPaywallState(): Promise<void> {
  await SecureStore.deleteItemAsync(PAYWALL_SHOWN_KEY);
}
