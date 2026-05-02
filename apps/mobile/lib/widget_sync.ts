import { Platform } from 'react-native';

interface WidgetState {
  date: string;
  pillarsLogged: string[];
  isClosed: boolean;
}

export async function syncWidgetState(state: WidgetState): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await syncIOS(state);
    } else if (Platform.OS === 'android') {
      await syncAndroid(state);
    }
  } catch {
  }
}

async function syncIOS(state: WidgetState): Promise<void> {
  const payload = JSON.stringify(state);
  const { NativeModules } = await import('react-native');
  if (NativeModules.WidgetSync?.setSharedData) {
    NativeModules.WidgetSync.setSharedData(payload);
  }
}

async function syncAndroid(state: WidgetState): Promise<void> {
  const payload = JSON.stringify(state);
  const { NativeModules } = await import('react-native');
  if (NativeModules.WidgetSync?.setSharedPrefs) {
    NativeModules.WidgetSync.setSharedPrefs('widget_state', payload);
  }
}
