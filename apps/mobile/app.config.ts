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
    image: './assets/icons/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0E0E0C',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'me.4wins.app',
    buildNumber: '1',
    infoPlist: {
      NSHealthShareUsageDescription:
        'We read your step count and workout minutes to automatically log your Physical pillar — no data leaves your device.',
      NSHealthUpdateUsageDescription:
        'We do not write to Health.',
      NSMicrophoneUsageDescription:
        'We need your microphone to transcribe voice notes for your journal entries.',
      NSUserNotificationUsageDescription:
        'We send one reminder per day at your chosen cue time.',
      UIBackgroundModes: ['fetch', 'remote-notification'],
    },
    entitlements: {
      'com.apple.security.application-groups': ['group.me.4wins.app'],
      'com.apple.developer.healthkit': true,
      'com.apple.developer.healthkit.background-delivery': true,
    },
    associatedDomains: [],
  },
  android: {
    package: 'me.4wins.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/icons/adaptive-icon-foreground.png',
      backgroundColor: '#0E0E0C',
    },
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_EXERCISE',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
    ],
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? undefined,
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
        sounds: [],
      },
    ],
    ['expo-apple-authentication'],
    'expo-av',
    'expo-localization',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.4wins.app',
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? 'YOUR_EAS_PROJECT_ID',
    },
  },
});
