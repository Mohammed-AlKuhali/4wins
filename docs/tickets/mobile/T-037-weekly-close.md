# T-037 — Weekly close screen

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-030
**Implements PRD:** §3 screen 17, §2 Flow D
**Brand bible:** §3 (sample copy), §8 (per-screen spec)

## Goal

The Sunday-evening weekly close. Entered via push tap or via week-strip tap on home. Shows seven mini-Quads, days-complete count, cumulative count. No comparisons, no grades.

## What to build

1. **`weekly/[isoWeek].tsx`:** the layout from PRD §4 — "The week closed." headline, 7 mini-Quads, day labels, cumulative count, single Continue button.
2. **Trigger:** the Sunday push deep-links to this screen with the current ISO week. Manual entry via the week strip on home.
3. **Generated server-side:** uses `GET /v1/week/:isoWeek` (cron-generated `weekly_summaries` row + on-demand fallback).
4. **No comparisons:** no week-over-week, no "your worst week," no grades. Just the data per brand.

## Files to create / modify

```
apps/mobile/app/(app)/weekly/[isoWeek].tsx
apps/mobile/components/weekly/
  WeekRow.tsx
  CumulativeCount.tsx           # if not already extracted from T-030
apps/mobile/hooks/useWeek.ts
apps/mobile/__tests__/weekly.test.tsx
```

## Acceptance criteria

- [ ] Renders the 7-mini-Quad row using T-023 MiniQuad.
- [ ] Headline + sub copy from PRD §4 layout (Fraunces Light 28/36 stacked).
- [ ] Cumulative count from `GET /v1/streak`.
- [ ] No comparisons, grades, or "compared to last week."
- [ ] Single Continue button → home.
- [ ] Deep link: opens correctly when tapped from a push notification.
- [ ] Tests: render with 7-of-7, 0-of-7, 6-of-7 (rest day mid-week), deep link from push.

## Non-goals

- Streak announcements ("you broke your streak this week" — banned).
- Sharing / image export.
- Year-end summaries (v1.5+).

## Notes for the agent

- ISO week format: `YYYY-Www`. URL example: `weekly/2026-W18`.
- Day labels: localized via `Intl.DateTimeFormat` for short weekday names.
- If a day was a rest day, mini-Quad renders as dotted (per T-023 `isRestDay` prop).
- "Cumulative" is the same number from home — read from streak cache.
