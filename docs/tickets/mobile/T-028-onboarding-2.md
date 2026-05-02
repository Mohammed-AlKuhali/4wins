# T-028 — Onboarding: identity + cue + notifications

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-027
**Implements PRD:** §2 Flow A steps 4–6
**Brand bible:** §3 (sample copy)

## Goal

Build the next three onboarding screens: identity statement, cue binding, and notification permission. After this ticket, the user has a fully configured account ready for Day-0 ritual (T-029).

## What to build

1. **Screen 04 — Identity statement** (`(onboarding)/identity.tsx`)
   - Copy from brand §3: "Who are you becoming?"
   - Multi-line text input below (3 lines visible, expandable to 6). Placeholder shown in `textTertiary` with example text.
   - On submit, PATCH `/v1/me { identity_statement }`, advance.
2. **Screen 05 — Cue binding** (`(onboarding)/cue.tsx`)
   - Copy: "When will you do this?"
   - Five preset cards in a vertical list:
     - "After my morning coffee" (cue_time_of_day=morning)
     - "Before my laptop" (cue_time_of_day=morning)
     - "When I close my laptop" (cue_time_of_day=evening)
     - "Before bed" (cue_time_of_day=before_bed)
     - "Custom..." (opens time picker → cue_time_of_day=custom + cue_time_local)
   - Single tap = select + advance. PATCH `/v1/me { cue_label, cue_time_of_day, cue_time_local? }`.
3. **Screen 06 — Notification permission** (`(onboarding)/notifications.tsx`)
   - Copy from brand §3 verbatim ("We send one push a day...").
   - Three buttons: "Allow, once a day" / "Allow, twice a day max" / "No notifications"
   - First two: request system permission, register Expo push token (`POST /v1/notifications/register`), set `notification_prefs.max_per_day` accordingly.
   - Third: PATCH prefs with `max_per_day=0`. No system permission requested.
   - Navigate to `(onboarding)/day-zero` (T-029).

## Files to create / modify

```
apps/mobile/app/(onboarding)/identity.tsx
apps/mobile/app/(onboarding)/cue.tsx
apps/mobile/app/(onboarding)/notifications.tsx
apps/mobile/components/PresetCard.tsx              # tap-to-select card pattern
apps/mobile/lib/push_register.ts                   # gets Expo token + posts
apps/mobile/__tests__/onboarding_2.test.tsx
```

## Acceptance criteria

- [ ] Identity screen has a multi-line input. Server-side max length 1000 chars; UI shows char count only when >800.
- [ ] Identity is required (button disabled until ≥10 chars). PATCH on submit.
- [ ] Cue screen: tapping a preset PATCHes and advances in one action. Custom opens a time picker (use `@react-native-community/datetimepicker`), then PATCHes with the selected local time.
- [ ] Notifications screen requests system permission via `expo-notifications` for first two options.
- [ ] If system permission is denied at OS level, show a small explanatory note: "Notifications turned off in system. You can change this in iOS/Android Settings." Don't block onboarding — set `max_per_day=0` and continue.
- [ ] Token registration happens only after permission granted. Failure to get a token logs but doesn't block onboarding.
- [ ] Tests: each screen renders, each option PATCHes the right body, custom time picker stores local time correctly.
- [ ] Brand rejection list §9 passes (no emoji, no "Hey", no exclamation marks, etc.).

## Non-goals

- No notification scheduling on the client side (server cron handles).
- No "test push" button.
- No timezone confirmation screen — `users.timezone` is set from `Localization.timezone` at sign-up.

## Notes for the agent

- `cue_time_local` defaults from PRD §5 if a preset is chosen (e.g. morning → 07:30). The server applies these defaults in T-005, but the client can pre-fill display labels using the same mapping.
- For the identity input, allow voice input via the system keyboard's mic — that's free, and consistent with the voice-first ethos.
- For Android push registration, may need a notification channel — set up "default" channel in `lib/push_register.ts`.
- The presets are written to feel like real moments, not "morning / evening" — brand bible §3 voice.
