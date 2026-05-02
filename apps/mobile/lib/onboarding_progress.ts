import * as SecureStore from 'expo-secure-store';

const KEY = 'onboardingProgress';

export interface OnboardingProgress {
  step: 'pillars' | 'tradition' | 'identity' | 'cue' | 'notifications' | 'day-zero' | 'complete';
  dayZeroPillarIndex: number;
}

export async function saveProgress(p: OnboardingProgress): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(p));
}

export async function loadProgress(): Promise<OnboardingProgress | null> {
  const v = await SecureStore.getItemAsync(KEY);
  return v ? (JSON.parse(v) as OnboardingProgress) : null;
}

export async function clearProgress(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
