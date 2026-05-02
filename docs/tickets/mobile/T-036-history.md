# T-036 — History + day-detail screens

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-030, T-006
**Implements PRD:** §3 screen 16
**Brand bible:** §3, §4, §5, §8 — same primitives, no new patterns

## Goal

Browseable history: a calendar-style grid of past days (each cell is a mini-Quad), tap a day to see its entries. Free tier capped to 30 days; older days blurred with paywall hint.

## What to build

1. **`history.tsx`:** vertical-scrolling grid, 7 columns (one per weekday), N rows, each cell ~44pt mini-Quad. Most-recent week at top.
2. **`history/[date].tsx`:** day detail. Larger Quad at top, list of that day's entries below in chronological order.
3. **Paywall behavior for free users:** days >30 days ago render as faint placeholder cells; tapping them opens the paywall modal.
4. **Pagination:** load more weeks as user scrolls; cap at 12 weeks for free, unlimited for paid.

## Files to create / modify

```
apps/mobile/app/(app)/history.tsx
apps/mobile/app/(app)/history/[date].tsx
apps/mobile/components/history/
  HistoryGrid.tsx
  DayCell.tsx
  DayDetail.tsx
  PaywalledCell.tsx
apps/mobile/hooks/useHistory.ts
apps/mobile/__tests__/history.test.tsx
```

## Acceptance criteria

- [ ] Grid renders 7-wide; days within last 30 are interactive, older are placeholder.
- [ ] Tap interactive day → day detail screen with entries list.
- [ ] Tap paywalled day → opens `(modals)/paywall`.
- [ ] Pagination: scroll triggers `GET /v1/history?from=&to=` for older weeks.
- [ ] Performance: virtualized list (use `FlatList` or `FlashList`).
- [ ] No tab bar.
- [ ] Brand rejection list §9 passes.
- [ ] Tests: free-tier behavior, paid-tier behavior, day detail rendering.

## Non-goals

- Editing past entries (read-only in v1).
- Annual calendar / heat map (v1.5).
- Export (v1.5; T-014 covers data export endpoint).

## Notes for the agent

- Compute "days within last 30" using user timezone, not device.
- Mini-Quad rendering must be performant — pre-cache SVG paths.
- Day detail entries list reuses `EntriesList` from T-030 (extract to shared component if not already).
- Free-tier "older than 30" is a hard server cap — `GET /v1/history?from=` further back returns 403; the UI just renders blurred placeholders.
