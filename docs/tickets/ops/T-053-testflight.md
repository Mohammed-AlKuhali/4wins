# T-053 — TestFlight + internal-testing flow

**Area:** ops
**Estimate:** 30 min
**Depends on:** T-051
**Implements PRD:** §0 (TestFlight by week 6)

## Goal

Wire up EAS Build → TestFlight (iOS) and EAS Build → Internal Testing track (Android). After this ticket, every push to `main` produces a build that's installable by the user's testing cohort.

## What to build (config + scripts)

1. EAS Build profiles in `eas.json`:
   - `development` (already in T-021)
   - `preview` (signed, internal testing)
   - `production` (App Store + Play release)
2. **iOS:** TestFlight internal group with the user's email + ≤25 internal testers.
3. **Android:** Internal Testing track with the same testers.
4. **EAS Submit** configured to push the preview profile to TestFlight + Play Internal automatically.
5. A small CLI script `npm run release:beta` that runs:
   - `eas build --platform ios --profile preview --auto-submit`
   - `eas build --platform android --profile preview --auto-submit`
6. A `docs/ops/release.md` documenting the flow.

## Acceptance criteria

- [ ] `eas build --platform ios --profile preview --auto-submit` succeeds end-to-end. App appears in TestFlight Internal within ~10 min.
- [ ] Same for Android Internal Testing.
- [ ] All internal testers can install via TestFlight + Play Console internal.
- [ ] Documentation explains: how to add a tester, how to release a beta, how to update internal vs external.
- [ ] The auto-submit doesn't release to public — internal track only.

## Non-goals

- Public TestFlight (external testing) — closer to launch.
- Production release.
- Crashlytics setup (T-054 is generic monitoring).

## Notes for the agent

- EAS account credentials are in Replit env (`EXPO_TOKEN`).
- For Apple, EAS handles certificate management automatically. Only manual step is the App Store Connect API key (one-time).
- For Google, EAS uses the service-account JSON.
- The user is the first internal tester — add their Apple ID + Google account.
- Don't ship to public TestFlight in v1 setup — closer-to-launch ticket.
