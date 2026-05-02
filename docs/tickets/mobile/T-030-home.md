# T-030 — Home screen

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-023, T-024, T-006
**Implements PRD:** §3 screen 09, §4 (per-screen spec)
**Brand bible:** §2, §3, §4, §5, §8

## Goal

The single most important screen in the app. Lives off `GET /v1/today`. Shows today's Quad, the next un-done pillar as CTA, today's entries list, this week's strip, cumulative count.

## What to build

1. **Above the fold:**
   - Top bar: "W18 · Sun" left (current ISO week + day), gear icon right (→ settings).
   - Centered Quad (~280pt diameter) using T-023.
   - Below Quad, single line in Fraunces 22/28: name of next un-done pillar OR "Closed."
   - Below that: caption — entry count + total time today (only if any pillar logged).
2. **Below fold (scrollable):**
   - "Today" section: today's entries listed in chronological order. Each entry shows pillar glyph (T-024), text snippet, and time. Tap → `pillar/[pillar].tsx`.
   - "This week" section: 7-mini-Quad strip for the current ISO week. Tap a day → `weekly/[isoWeek].tsx` with that day highlighted.
   - "Cumulative" section: Plex Mono 32 number with caption "days complete."
3. **State branches:**
   - New user (Day 0 done, partial today): Quad partial, "Next: [pillar]," entries strip shows Day-0 lazy entries.
   - Mid-day, returning: Quad partial, "Next: [pillar]."
   - Closed: Quad full, "Closed." Below: "Tomorrow opens fresh."
   - Missed yesterday: above the Quad in caption — "Yesterday was a rest day. Today is open." (or just "Today is a new day.")
4. **Pull-to-refresh:** ENABLED for the entries list scroll area, but the Quad itself does not respond. Pull only refreshes today's entries (not the day's "state").
5. **No tab bar** anywhere. Settings icon is the only top-bar nav.

## Files to create / modify

```
apps/mobile/app/(app)/home.tsx
apps/mobile/components/home/
  HomeQuad.tsx               # the centered hero Quad with state from /v1/today
  EntriesList.tsx
  WeekStrip.tsx
  CumulativeCount.tsx
  NextPillarCTA.tsx
  MissedDayBanner.tsx
apps/mobile/hooks/useToday.ts
apps/mobile/__tests__/home.test.tsx
```

## Acceptance criteria

- [ ] Cold start → home renders within 300ms of API response (use suspense / skeleton during fetch).
- [ ] `useToday()` hook calls `GET /v1/today` and caches via react-query.
- [ ] Quad reflects real day state from API.
- [ ] "Next un-done pillar" CTA tap navigates to `pillar/[pillar]`.
- [ ] Tapping any pillar arc on the Quad also navigates to that pillar's capture.
- [ ] Entries list shows today's entries with pillar glyph + text + time, scrollable.
- [ ] Week strip renders 7 mini-Quads for current ISO week. Today highlighted with a subtle ring.
- [ ] Cumulative count comes from `GET /v1/streak`.
- [ ] Closed-day state shows "Closed." and "Tomorrow opens fresh."
- [ ] Missed-day state shows the banner above Quad (caption color, not warning red).
- [ ] No streak number visible on the home screen (per brand §3 — streak lives in widget only).
- [ ] No tab bar. No FAB. No bottom-fixed elements except SafeArea bottom.
- [ ] Tests: snapshots for 5 representative states (new, mid-day, closed, missed, rest day).

## Non-goals

- Pillar capture (T-031/T-032/T-033/T-034).
- Day complete animation (T-035 — but it auto-plays after the 4th pillar from this screen indirectly).
- Day detail / history (T-036).
- Settings UI (T-038).

## Notes for the agent

- `useToday()` should be the only place `/v1/today` is called — every component reads from cache.
- For week strip, fetch via `GET /v1/week/:isoWeek` (cron-generated), or compute client-side from cached entries — pick the simpler one. Recommend cron.
- Time formatting: 12-hour with am/pm by default; locale-aware (`Intl.DateTimeFormat`).
- Pull-to-refresh: use `RefreshControl` only on the inner ScrollView for entries; Quad sits above it.
- When user completes the 4th pillar and returns to home, the close animation auto-fires (T-035 owns it; this screen invokes it via prop on Quad).
- Performance: memoize all sub-components; the Quad re-render is the most expensive.
