import { Platform } from 'react-native';
import { getTodayMovement } from './ios';
import { getTodayMovementAndroid } from './android';
import { meetsMovementThreshold } from './detect_movement';
import { apiJson } from '../api';

let observerInstalled = false;

export async function setupHealthObserver(): Promise<void> {
  if (observerInstalled) return;
  observerInstalled = true;

  if (Platform.OS === 'ios') {
    const { NativeModules, NativeEventEmitter } = await import('react-native');
    if (!NativeModules.RNHealth) return;
    const emitter = new NativeEventEmitter(NativeModules.RNHealth);
    emitter.addListener('HealthKitObserverUpdate', async () => {
      await checkAndAutoLog();
    });
    NativeModules.RNHealth.enableBackgroundDelivery?.();
  }
}

async function checkAndAutoLog(): Promise<void> {
  try {
    const fn = Platform.OS === 'ios' ? getTodayMovement : getTodayMovementAndroid;
    const data = await fn();
    if (!data || !meetsMovementThreshold(data)) return;

    const today = await apiJson<{ entries: { pillar: string; inputMethod: string }[] }>('/v1/today');
    const alreadyLogged = today.entries.some(
      (e) => e.pillar === 'physical' && e.inputMethod === `${data.source}_auto`,
    );
    if (alreadyLogged) return;

    await apiJson('/v1/entries', {
      method: 'POST',
      body: JSON.stringify({
        pillar: 'physical',
        input_method: `${data.source}_auto`,
        structured_data: {
          source: data.source,
          steps: data.steps,
          kcal: data.activeEnergyKcal,
          duration_min: data.workoutMinutes,
          kind: data.kind,
        },
      }),
    });
  } catch {}
}
