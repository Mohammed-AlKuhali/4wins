# 4Wins Mobile — Setup Guide

## Prerequisites

- Node 22
- Expo CLI: `npm install -g expo-cli eas-cli`
- For iOS builds: Mac with Xcode 15+ (or use EAS cloud)
- For Android builds: Android Studio or EAS cloud

## First-time setup

```bash
cd apps/mobile
npm install
cp .env.example .env.local
# Fill in .env.local with real values
```

## Development

```bash
# Start Expo dev server
npx expo start

# Open on iOS simulator (Mac only)
npx expo start --ios

# Open on Android emulator
npx expo start --android

# Open in Expo Go (limited — native modules won't work)
npx expo start --tunnel
```

The dev server connects to `EXPO_PUBLIC_API_URL` (defaults to `http://localhost:8080`).
Make sure the backend is running: `cd ../.. && npm run dev`

## Running tests

```bash
npm test                    # all unit tests (jest-expo)
npm run typecheck           # TypeScript check
npm run lint                # ESLint
```

## EAS Cloud Builds (no Mac required)

```bash
# One-time: link to EAS project
eas init

# Development build (install on device via TestFlight internal)
eas build --platform ios --profile development

# Preview build (TestFlight internal beta)
eas build --platform ios --profile preview

# Production build + submit to App Store
eas build --platform ios --profile production --auto-submit
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | yes | Backend API base URL |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS` | yes | Google Sign-In iOS client |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID` | yes | Google Sign-In Android client |
| `EAS_PROJECT_ID` | yes (for builds) | EAS project UUID |

## Native modules (require a native build)

These features require a development build (not Expo Go):

| Feature | Module | Platform |
|---------|--------|---------|
| Apple Sign-In | `expo-apple-authentication` | iOS only |
| Push notifications | `expo-notifications` | iOS + Android |
| HealthKit | `NativeModules.RNHealth` | iOS only |
| Health Connect | `NativeModules.HealthConnect` | Android only |
| Home widget | `NativeModules.WidgetSync` | iOS + Android |
| Voice recording | `expo-av` | iOS + Android |

HealthKit and widget sync require custom native code not yet bundled in a managed Expo module. These features degrade gracefully — the app works without them, they just don't auto-populate the Physical pillar.

## Fonts

Fonts are loaded via `@expo-google-fonts/*` — no manual font file placement needed.
They are bundled at build time by `expo-font`.

## Architecture

See `../../docs/ops/ARCHITECTURE.md` for the full system diagram.
See `../../docs/ops/SUBMISSION_CHECKLIST.md` before App Store submission.
