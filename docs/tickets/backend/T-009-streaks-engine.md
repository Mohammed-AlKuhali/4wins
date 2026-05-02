# T-009 — Streaks engine + endpoints

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-006
**Implements PRD:** §2 Flow C (missed day), §3 Flow D (weekly close), §6 (GET /v1/streak)
**Brand bible:** §3 (humane streaks — no shame loops)

## Goal

Implement the streak engine: counts consecutive days where the Quad closed, applies streak freezes from `freezes_remaining_this_month`, never punishes, and exposes `GET /v1/streak`. Replaces the stub from T-006.

## What to build

1. `recomputeStreak(userId)` — replaces T-006 stub. Reads recent days, walks backward from today, applies freeze logic, updates `streaks` row.
2. `applyDailyRollover(userId)` — called by cron (T-010): at user's local 4am, mark missed days as rest days if freezes available, otherwise reset streak silently.
3. `refreshMonthlyFreezes(userId)` — called monthly: sets `freezes_remaining_this_month = 2`, advances `month_year`.
4. `GET /v1/streak` — returns current state.
5. Streak math rules (locked):
   - Streak begins counting on **Day 2** (the day AFTER the first complete day).
   - A complete day extends the streak by 1.
   - A missed day with available freeze: `is_rest_day=true` on that day, freeze decremented, streak unaffected.
   - A missed day with NO freeze: streak resets to 0 silently. **No notification, no UI message about "lost streak."**
   - `longest_count` only updates on increment, never on reset (it's a high-water mark).
   - `cumulative_completions` is computed (NOT stored): `SELECT COUNT(*) FROM days WHERE user_id=? AND closed_at IS NOT NULL`.
6. Tests for: first complete day → streak=0 still (Day 2 starts), second consecutive complete → 1, miss with freeze → still 1, miss without freeze → 0, freeze count decrements correctly, monthly refresh.

## Files to create / modify

```
src/domain/streaks/
  recompute.ts             # REAL implementation (replaces T-006 stub)
  daily_rollover.ts        # called by cron T-010
  monthly_refresh.ts       # called by cron T-010
  cumulative.ts            # COUNT(*) helper

src/routes/streak.ts       # GET /v1/streak

src/app.ts                 # register route

tests/streaks.test.ts
```

## API shape

### `GET /v1/streak` response

```ts
{
  current: number;
  longest: number;
  freezes_remaining_this_month: number;
  freezes_used_total: number;
  last_complete_date: string | null;     // 'YYYY-MM-DD'
  cumulative_completions: number;        // computed
}
```

## Acceptance criteria

- [ ] `recomputeStreak` is idempotent — calling twice in a row produces the same result.
- [ ] Day 1 complete → `current=0, longest=0`. Day 2 also complete → `current=1, longest=1`.
- [ ] Five consecutive complete days starting Day 1 → `current=4, longest=4` after Day 5 (Day 1 doesn't count, Day 2-5 = 4 days).
- [ ] Six consecutive, Day 7 missed (with freeze available): `current=5, longest=5, freezes_remaining=1, days[Day7].is_rest_day=true`.
- [ ] Six consecutive, Day 7 missed (no freezes): `current=0, longest=5`. No `is_rest_day` set.
- [ ] After streak reset, completing the next day → `current=0` (Day 2 rule), then next-next → `current=1`.
- [ ] `applyDailyRollover` is safe to call multiple times for the same date (idempotent).
- [ ] `refreshMonthlyFreezes` is idempotent: only sets `freezes_remaining_this_month=2` if `month_year != current_month`. Updates `month_year` to current.
- [ ] `GET /v1/streak` returns the shape above for any authenticated user (creates `streaks` row lazily if absent — first-time user).
- [ ] Tests: 10+ cases covering the streak math + rollover edge cases.
- [ ] No `audit_event` emitted for streak resets (zero-shame rule). Rest-day applies emit `audit_events.event='rest_day_applied'`.

## Non-goals

- No "longest in a year" or other time-window aggregations (later analytics).
- No streak-pause feature (vacation mode) — v1.5 if requested.
- No social streaks / shared streaks.
- No streak-broken push (PRD bans this).

## Notes for the agent

- Walk backwards from today: fetch the last ~40 days of `days` rows ordered by date desc, then iterate. Don't fetch all of history.
- "Day 2 rule": this is implemented by counting only days `>` than the first complete day. So if the first ever complete day is `2026-05-02`, the streak counts complete days from `2026-05-03` onward.
- Edge case: user completes Day 1, skips Day 2 (no freeze), completes Day 3 → first-ever complete day is `2026-05-01`, but streak resets after Day 2's miss. So when Day 3 completes, streak = 0 (Day 2 rule applies again — Day 3 is the new "Day 1," so Day 4's completion will be `current=1`). Treat each reset as a fresh "first complete day."
- Implement the algorithm as: `findStreakStart(userId)` returns the date the user's CURRENT streak began (or null). Then `current` = number of complete days strictly after that date up to today.
- `daily_rollover` cron: called per-user at their local 4am. Looks at "yesterday" in user tz. If `pillars_logged.length < 4` and `!is_rest_day`:
  - If `freezes_remaining > 0`: set `is_rest_day=true`, decrement freezes, recompute streak (will preserve).
  - Else: do nothing (streak naturally resets when next complete day computes).
- `monthly_refresh` cron: at `00:01` local-of-1st, set `freezes_remaining_this_month=2`, `month_year='YYYY-MM'`.
