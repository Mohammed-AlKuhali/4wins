import * as Notifications from 'expo-notifications';
import * as Device from 'expo-application';
import { Platform } from 'react-native';
import { apiJson } from './api';

export async function registerPushToken(maxPerDay: 1 | 2): Promise<void> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    await apiJson('/v1/me', {
      method: 'PATCH',
      body: JSON.stringify({ notification_prefs: { max_per_day: 0 } }),
    });
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  await apiJson('/v1/notifications/register', {
    method: 'POST',
    body: JSON.stringify({ token, platform: Platform.OS }),
  });

  await apiJson('/v1/me', {
    method: 'PATCH',
    body: JSON.stringify({ notification_prefs: { max_per_day: maxPerDay } }),
  });
}
