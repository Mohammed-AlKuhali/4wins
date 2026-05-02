import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

interface RNHealthModule {
  requestAuthorization(types: string[]): Promise<boolean>;
  getTodayMovement(): Promise<{
    steps: number;
    activeEnergyKcal: number;
    workoutMinutes: number;
  } | null>;
  startBackgroundObserver(types: string[]): Promise<void>;
}

interface HealthConnectModule {
  requestPermissions(types: string[]): Promise<boolean>;
  getTodayMovement(): Promise<{
    steps: number;
    activeEnergyKcal: number;
    workoutMinutes: number;
  } | null>;
}

const { RNHealth, HealthConnect } = NativeModules as {
  RNHealth?: RNHealthModule;
  HealthConnect?: HealthConnectModule;
};

export const isHealthKitAvailable = (): boolean =>
  Platform.OS === 'ios' && !!RNHealth;

export const isHealthConnectAvailable = (): boolean =>
  Platform.OS === 'android' && !!HealthConnect;

export async function requestHealthPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios' && RNHealth) {
    return RNHealth.requestAuthorization(['steps', 'activeEnergyBurned', 'workoutMinutes']);
  }
  if (Platform.OS === 'android' && HealthConnect) {
    return HealthConnect.requestPermissions([
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_EXERCISE',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
    ]);
  }
  return false;
}

export async function getTodayMovement() {
  if (Platform.OS === 'ios' && RNHealth) {
    return RNHealth.getTodayMovement();
  }
  if (Platform.OS === 'android' && HealthConnect) {
    return HealthConnect.getTodayMovement();
  }
  return null;
}

export function createHealthObserver(callback: () => void): () => void {
  if (Platform.OS !== 'ios' || !RNHealth) return () => {};
  const emitter = new NativeEventEmitter(RNHealth as unknown as Parameters<typeof NativeEventEmitter>[0]);
  const sub = emitter.addListener('RNHealthMovementUpdate', callback);
  RNHealth.startBackgroundObserver(['steps', 'activeEnergyBurned', 'workoutMinutes']).catch(() => {});
  return () => sub.remove();
}
