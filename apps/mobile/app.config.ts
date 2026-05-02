import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '4Wins',
  slug: '4wins',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icons/icon.png',
  scheme: '4wins',
  userInterfaceStyle: 'automatic',
  splash: {
    backgroundColor: '#0E0E0C',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'me.4wins.app',
    infoPlist: {
      NSHealthShareUsageDescription: 'We read step and workout data to auto-log your Physical pillar.',
      NSMicrophoneUsageDescription: 'We need your microphone to transcribe your voice notes.',
    },
    entitlements: {
      'com.apple.security.application-groups': ['group.me.4wins.app'],
      'com.apple.developer.healthkit': true,
      'com.apple.developer.healthkit.background-delivery': true,
    },
  },
  android: {
    package: 'me.4wins.app',
    adaptiveIcon: {
      backgroundColor: '#0E0E0C',
    },
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_EXERCISE',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
      'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/icons/notification-icon.png',
        color: '#0E0E0C',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-apple-authentication',
    ],
    'expo-av',
    'expo-localization',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080',
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
  },
});
