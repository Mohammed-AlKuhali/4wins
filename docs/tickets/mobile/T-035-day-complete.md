# T-035 — Day complete animation

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-030
**Implements PRD:** §3 screen 15, §2 Flow B step 7
**Brand bible:** §7 (the "close the day" sequence beat-by-beat)

## Goal

When the 4th pillar is logged, the home screen plays the close-day animation specced in brand §7 — 0.8s ring fill + 1 haptic at 800ms, 0.4s settle, "Closed." appears for ~1.4s, then home is left in the closed state.

## What to build

1. A `<DayCompleteOverlay />` component that plays over the home screen when `day.closed_at` transitions from null to non-null in the cache.
2. The animation timing exactly matches brand §7:
   - 0–800ms: 4th arc strokes on, color saturates.
   - 800ms: `Haptics.impactAsync('medium')` once.
   - 800–1200ms: Quad scale 0.98→1.0, no bounce.
   - 1200ms: "Closed." fades in (Fraunces Light 40/48), 400ms fade.
   - 2400ms total: stays on screen until user taps to dismiss.
3. Tappable to dismiss (anywhere on screen) → returns to home in closed state.
4. Persisted "have we already shown today's close" flag — never re-trigger if user reopens app same day.

## Files to create / modify

```
apps/mobile/components/home/DayCompleteOverlay.tsx
apps/mobile/lib/day_complete_state.ts
apps/mobile/app/(app)/home.tsx                      # mount overlay, trigger on transition
apps/mobile/__tests__/day_complete.test.tsx
```

## Acceptance criteria

- [ ] Overlay triggers exactly when `useToday()` data shows `closed_at` newly non-null.
- [ ] Animation timing matches brand §7 (verify with test: 800ms haptic, 1200ms text fade-in start).
- [ ] No confetti, no particle effects, no celebratory sound.
- [ ] Single haptic, medium intensity, exactly once.
- [ ] Tap anywhere dismisses; home shows closed Quad with "Closed." caption + "Tomorrow opens fresh."
- [ ] If user closes app during animation and reopens same day, animation does NOT re-trigger.
- [ ] Persistence key includes `day.id` — next day's close re-triggers as expected.
- [ ] Tests: snapshot, timing, anti-replay.

## Non-goals

- Sharing / "share my Quad" object (separate ticket if added — currently deferred to launch phase).
- Streak announcements.
- "X days in a row!" type copy (banned per brand).

## Notes for the agent

- Use Reanimated `withSpring` and `withTiming` to compose the timing. A single `useAnimatedStyle` driven by a `progress` value `0 → 1` over 2400ms makes synchronization clean.
- The "Closed." text: render in `<Text variant="display">`. Centered.
- The overlay is full-screen with the closed Quad rendered on top of a dimmed background (95% bg color).
- Persist "shown for day X" in `expo-secure-store` keyed by `day.id`.
- Don't dispatch any analytics event from the animation — telemetry comes from the entry POST, not the UI animation.
