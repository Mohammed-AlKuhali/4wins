import { Platform } from 'react-native';
import type { MovementData } from './detect_movement';

export async function requestHealthKitPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    const { NativeModules } = await import('react-native');
    if (!NativeModules.RNHealth) return false;
    const granted: boolean = await NativeModules.RNHealth.requestAuthorization([
      'Steps', 'ActiveEnergyBurned', 'Workout',
    ]);
    return granted;
  } catch {
    return false;
  }
}

export async function getTodayMovement(): Promise<MovementData | null> {
  if (Platform.OS !== 'ios') return null;
  try {
    const { NativeModules } = await import('react-native');
    if (!NativeModules.RNHealth) return null;
    const data = await NativeModules.RNHealth.getTodayMovement() as {
      steps: number;
      activeEnergyKcal: number;
      workoutMinutes: number;
      kind?: string;
    };
    return { ...data, source: 'healthkit' };
  } catch {
    return null;
  }
}
