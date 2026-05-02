import { NativeModules, Platform } from 'react-native';

interface WidgetSyncModule {
  setSharedData(payload: string): void;
  setSharedPrefs(key: string, payload: string): void;
}

const { WidgetSync } = NativeModules as { WidgetSync?: WidgetSyncModule };

export const isWidgetSyncAvailable = (): boolean =>
  !!WidgetSync;

export function writeWidgetData(payload: string): void {
  if (!WidgetSync) return;
  if (Platform.OS === 'ios') {
    WidgetSync.setSharedData(payload);
  } else {
    WidgetSync.setSharedPrefs('widget_state', payload);
  }
}
