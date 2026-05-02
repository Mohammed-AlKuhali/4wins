# T-029 — Onboarding: Day-0 ritual + first close

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-028, T-023, T-024
**Implements PRD:** §2 Flow A steps 7–9
**Brand bible:** §2 (Quad), §3, §7 (close animation)

## Goal

The most important onboarding screen — ship the user to a closed Quad in their first session. Walks them through one tiny win for each pillar via the lazy path, animates the Quad arc by arc, ends with the §7 close-the-day animation.

## What to build

1. **Screen 07 — Day-0 ritual** (`(onboarding)/day-zero.tsx`)
   - Top: a partially-filled Quad (state evolves as the user progresses).
   - Center: Fraunces prompt for the current pillar (rotating: Mental → Financial → Spiritual → Physical).
   - Bottom: a single primary button "Log a tiny [pillar]" that submits a `lazy_path` entry via `POST /v1/entries`.
   - After each tap, the Quad arc fills (use the T-023 animation), then the next pillar appears.
   - After the 4th, the close-day animation plays.
2. **Screen 08 — First Quad closed** (`(onboarding)/first-close.tsx`)
   - Plays for 2.4s automatically from T-023's close animation.
   - Then displays "You closed your first Quad." in Fraunces 28/36.
   - Single CTA at bottom: "Continue" — navigates to `(app)/home`.
3. The Day-0 ritual is **non-skippable** (per PRD). Back gesture disabled. Closing the app re-routes back here on next open until complete.
4. If the user closes the app mid-ritual, the next push (4h later) is "Finish your first Quad — 90 seconds left."

## Files to create / modify

```
apps/mobile/app/(onboarding)/day-zero.tsx
apps/mobile/app/(onboarding)/first-close.tsx
apps/mobile/lib/onboarding_progress.ts            # local persisted state in case of crash
apps/mobile/__tests__/day_zero.test.tsx
```

## Day-0 prompts (locked)

```
Mental:    "What's one thing you'd like to learn?"
Financial: "Did your money behavior today match the person you're becoming?"
           [Yes] [Not quite] [Not today]   <- 3 buttons here, not lazy_path
Spiritual: (tradition-routed; brand bible §3 has the 5 variants)
Physical:  "Move your body. One minute counts."
```

For Day-0, all pillars use a one-tap lazy-path EXCEPT Financial which uses its 3-button form. The Spiritual prompt uses the user's selected tradition.

## Acceptance criteria

- [ ] Quad starts empty, then fills arc-by-arc as user completes each pillar.
- [ ] Each arc fill triggers via T-023's animation (600-800ms).
- [ ] Financial pillar shows the 3-button form, not a single lazy button.
- [ ] After the 4th pillar, the close-day animation plays automatically (2.4s, single haptic, no confetti).
- [ ] Then advance to `first-close.tsx` showing "You closed your first Quad."
- [ ] Back gesture disabled throughout.
- [ ] State persists locally — if app is killed mid-ritual, resumes from the right pillar on next launch.
- [ ] On `Continue`, navigate to `(app)/home`. Home shows today's Quad fully closed (since 4 entries exist).
- [ ] All 4 entries created server-side via `POST /v1/entries` with `input_method=lazy_path` (or for Financial, `input_method=type` with the binary as `structured_data`).
- [ ] Tests: end-to-end Day-0 flow, mid-ritual crash recovery, all 4 entries POSTed correctly.

## Non-goals

- No voice input on Day 0 — keep onboarding friction-free with lazy path only (user can use voice on Day 1+).
- No editing the auto-generated entries from Day 0 in this ticket.
- No "skip onboarding" debug flag — keep it real.

## Notes for the agent

- Use `OnboardingContext` to hold the current pillar index. Persist to `expo-secure-store` after each successful entry.
- The Spiritual prompt depends on `users.tradition` — read from cache or re-fetch `/v1/me` if not available.
- For the close-day animation, lift it up from T-023 — pass `closingAnimation={true}` to the Quad after the 4th pillar lands.
- The 4-hour re-engagement push is enqueued server-side when this screen mounts but isn't completed yet — fire a `POST /v1/onboarding/incomplete` (a small backend addition NOT in T-005; consider scoping into T-013 push templates as `template='onboarding_resume'`).
- Visual: keep it spacious. The Quad fills the upper third, prompt centered in the middle third, button in the bottom third.
- After the 4th pillar tap, briefly show "Closed." in Fraunces over the closed Quad before advancing to first-close.
