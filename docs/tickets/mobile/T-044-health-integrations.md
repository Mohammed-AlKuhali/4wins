# T-044 — HealthKit + Health Connect read

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-031
**Implements PRD:** §0 (Physical pillar auto-import), §6 (entries with healthkit_auto)
**Brand bible:** §2 (Physical pillar auto-detected when possible)

## Goal

Detect whether the user moved today via HealthKit (iOS) or Health Connect (Android), and auto-create a Physical pillar entry when so. Read-only — never write to Health.

## What to build

1. **Permission flow:** during onboarding (or first time the user opens Physical pillar capture), request Health read access for: steps, active energy burned, workouts.
2. **Detection rule:** today qualifies as "moved" if any of: ≥3000 steps, ≥10 minutes of any workout, ≥100 kcal active energy.
3. **Auto-entry creation:** when the rule fires AND no Physical entry exists for today, POST `/v1/entries` with `pillar=physical, input_method=healthkit_auto` (or `health_connect_auto`), `structured_data={ source, kind?, duration_min, steps?, kcal? }`.
4. **Background:** use HealthKit observers (iOS) and Health Connect listeners (Android) to detect threshold cross during the day, not only on app open.
5. **Permission denied path:** the Physical pillar capture screen falls back to the manual prompt from T-031.
6. **Privacy:** never persist health data on our server beyond the structured_data summary on the entry. No raw step counts in audit logs.

## Files to create / modify

```
apps/mobile/lib/health/
  ios.ts                       # HealthKit wrapper
  android.ts                   # Health Connect wrapper
  detect_movement.ts           # threshold logic
  observer_setup.ts
apps/mobile/app/(app)/_layout.tsx     # initialize observers on app start
apps/mobile/__tests__/health.test.ts
```

## Acceptance criteria

- [ ] First-time Physical capture requests Health permission (iOS HealthKit / Android Health Connect).
- [ ] If user has ≥3000 steps today, the auto-entry is created server-side; the capture screen shows "You moved today. Logged."
- [ ] If thresholds aren't met, the capture screen shows the manual prompt.
- [ ] If permission denied, the manual prompt is the default (no error).
- [ ] Auto-entry includes `structured_data.source = 'healthkit' | 'health_connect'` and `structured_data.kind` if a workout was detected.
- [ ] HealthKit observer fires within 5 min of a workout completion to create the entry without app being open.
- [ ] No raw step counts logged on server beyond the structured_data summary.
- [ ] Tests: threshold logic for each pathway (steps, workouts, kcal), permission denied flow, observer-triggered creation.

## Non-goals

- Writing to Health (we don't push entries to HealthKit — too easy to get rejected by Apple).
- Sleep / HRV / heart rate analysis (v1.5).
- "Choose what to import" UI (v1.5).
- Wear OS / WatchKit data (v1.5).

## Notes for the agent

- iOS: use `react-native-health` (community) wrapped via Expo Modules API. Add HealthKit entitlement in `app.config.ts`.
- Android: use `expo-health-connect` (community) or write a small Health Connect bridge.
- Observers: iOS HealthKit `HKObserverQuery` with background delivery enabled. Android Health Connect: `HealthConnectClient.getOrCreate(context)` + a periodic WorkManager check.
- Threshold check: compute inside the helper; client decides to POST. Don't push every step update — debounce.
- The "You moved today. Logged." prompt comes from brand bible §3 verbatim.
- Don't show the user a full breakdown ("12,847 steps and 2 workouts!") — brand voice is restraint. The single sentence is enough.
