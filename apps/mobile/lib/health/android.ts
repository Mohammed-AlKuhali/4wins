import { Platform } from 'react-native';
import type { MovementData } from './detect_movement';

export async function requestHealthConnectPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const { NativeModules } = await import('react-native');
    if (!NativeModules.HealthConnect) return false;
    const granted: boolean = await NativeModules.HealthConnect.requestPermissions([
      'READ_STEPS', 'READ_EXERCISE', 'READ_ACTIVE_CALORIES_BURNED',
    ]);
    return granted;
  } catch {
    return false;
  }
}

export async function getTodayMovementAndroid(): Promise<MovementData | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const { NativeModules } = await import('react-native');
    if (!NativeModules.HealthConnect) return null;
    const data = await NativeModules.HealthConnect.getTodayMovement() as {
      steps: number;
      activeEnergyKcal: number;
      workoutMinutes: number;
      kind?: string;
    };
    return { ...data, source: 'health_connect' };
  } catch {
    return null;
  }
}
