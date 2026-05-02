# T-021 — Expo project setup + repo structure

**Area:** mobile
**Estimate:** 30 min
**Depends on:** none
**Implements PRD:** §0 (scope), §8 (NFRs), resolved decision: Replit + Expo
**Brand bible:** none directly

## Goal

Stand up the Expo / React Native project that becomes the iOS + Android client. Establish folder structure that the next 17+ mobile tickets build into.

## What to build

1. Expo SDK 53+ project with TypeScript, in a separate folder from the backend (`apps/mobile/` if monorepo, or its own repo — choose one and document).
2. Package set: `expo`, `expo-router` (file-based routing), `react-native-reanimated`, `react-native-svg`, `expo-haptics`, `expo-localization`, `expo-secure-store`, `expo-application`, `expo-notifications`, `expo-auth-session`, `expo-apple-authentication`, `expo-av` (for voice recording), `expo-health` (or `react-native-health` via Expo Modules).
3. Strict TypeScript, ESLint with React Native preset.
4. Repo skeleton (see §Files).
5. A blank home screen at `app/index.tsx` rendering "4Wins" in Fraunces — proves the font loading works.
6. EAS Build config (`eas.json`) for development and preview profiles. Production profile stub for later.
7. App config (`app.config.ts` instead of `app.json` for env interpolation).
8. Bundle ID: `me.4wins.app` (iOS), `me.4wins.app` (Android).
9. Open-source font loading: Fraunces, IBM Plex Sans, IBM Plex Mono via `expo-font` from `@expo-google-fonts/*`.

## Files to create

```
apps/mobile/
  app.config.ts
  babel.config.js
  metro.config.js
  tsconfig.json
  package.json
  eas.json
  .gitignore
  README.md
  app/                              # expo-router pages
    _layout.tsx                     # root stack
    index.tsx                       # placeholder home
  components/                       # shared components (later tickets)
    .gitkeep
  hooks/                            # shared hooks (later tickets)
    .gitkeep
  lib/
    env.ts                          # client env (EXPO_PUBLIC_*)
    api.ts                          # placeholder; T-005/T-026 fill in
    fonts.ts                        # font loading helper
  theme/                            # T-022 fills in
    .gitkeep
  i18n/                             # T-045 fills in
    .gitkeep
  assets/
    fonts/                          # downloaded by expo-font config plugin (mostly via google fonts pkg)
    icons/
      .gitkeep
  __tests__/
    smoke.test.ts                   # boots, renders home, finds "4Wins"
```

## Acceptance criteria

- [ ] `npx expo install` succeeds, no peer-dep errors.
- [ ] `npx expo start` runs, the app loads on iOS Simulator + Android emulator + Expo Go.
- [ ] Home screen renders "4Wins" in Fraunces (visible difference from system font confirms font load).
- [ ] `npx expo run:ios` produces a development build that launches on a physical device via TestFlight Internal once provisioning is set up (out of scope here, but must compile).
- [ ] `tsc --noEmit` passes.
- [ ] `eslint .` passes.
- [ ] Bundle ID is `me.4wins.app` in both platform configs.
- [ ] EAS profiles defined: `development`, `preview`, `production`.
- [ ] `app.config.ts` reads from `EXPO_PUBLIC_API_URL` env var.

## Non-goals

- No screens beyond the placeholder.
- No theming yet (T-022).
- No auth yet (T-026).
- No assets yet beyond fonts (T-024 owns pillar glyphs).
- Production bundle signing — a later ops ticket (T-051/T-052).

## Notes for the agent

- Use `expo-router` v3+ with typed routes. File-based navigation simplifies the screen tickets ahead.
- Use `@expo-google-fonts/fraunces`, `@expo-google-fonts/ibm-plex-sans`, `@expo-google-fonts/ibm-plex-mono` packages.
- `lib/api.ts` placeholder: a typed fetch wrapper that reads `EXPO_PUBLIC_API_URL` and `lib/env.ts` defaults to `http://localhost:8787` for dev.
- Don't add `react-native-paper`, `nativewind`, `gluestack`, `tamagui`, or any other UI kit. Brand bible §3+§4 dictates everything; we build from primitives.
- Don't add `react-query` yet — T-026 will introduce it.
- Don't add Lucide / icon packs (brand bible §6 — custom only).
- Don't use the Expo `Onboarding` template — they ship Inter on white, that's banned.
