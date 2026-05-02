# T-010 — Cron jobs

**Area:** backend
**Estimate:** 90 min
**Depends on:** T-009
**Implements PRD:** §7 (Background jobs), §2 Flows C/D, §3 Flow D
**Brand bible:** §3 (push voice — invitational, never accusatory)

## Goal

Stand up the cron / scheduled-job system on Replit and ship the seven jobs from PRD §7. After this ticket, the system runs autonomously: streaks update at user 4am, weekly summaries generate Sunday evening, pushes fire at user cue times, monthly freezes refresh on 1st.

## What to build

1. **Job runner:** a single `src/cron/runner.ts` that runs every 5 minutes and dispatches to per-job logic, checking each user's timezone to decide whether the job fires for them in this tick. Replit cron scheduler hits this one entrypoint.
2. **Idempotency log:** `jobs_run_log` table records `(job, user_id?, run_for_date, ran_at)` so reruns are no-ops.
3. **The seven jobs:**
   - `apply_streak_freezes` — at user-local 4am, runs `applyDailyRollover` (T-009).
   - `generate_weekly_summary` — at user-local Sunday 8pm (or evening cue), upserts `weekly_summaries` row.
   - `send_morning_cue_push` — at user-local cue time (configured in `users.cue_time_local`), sends the daily push via Expo Push (T-013 stub for now; this ticket emits to a queue).
   - `send_evening_cue_push` — at Sunday user-local evening cue: "The week closed. X of 7 days complete."
   - `generate_day_30_insights` — when user has 30 distinct days with `closed_at IS NOT NULL` and no insights generated yet, generate (T-011 implements; this ticket calls a stub).
   - `refresh_monthly_freezes` — at user-local 00:01 of 1st of month, runs `refreshMonthlyFreezes` (T-009).
   - `send_trial_ending_banner` — daily, set in-app banner flag for users on day 11 of trial.
4. **Push queue:** rather than calling Expo Push directly here, write to a `push_queue` table. T-013 owns the actual sender. (Decoupling makes pushes retryable.)
5. **Per-job tests** — given a fixed `now` and a user with known tz/cue, each job either fires or doesn't.
6. **Replit Reserved schedule config** — document the cron expression and how it's set up in Replit's UI/config.

## Files to create / modify

```
src/cron/
  runner.ts                     # entrypoint called by Replit scheduler
  jobs/
    apply_streak_freezes.ts
    generate_weekly_summary.ts
    send_morning_cue_push.ts
    send_evening_cue_push.ts
    generate_day_30_insights.ts
    refresh_monthly_freezes.ts
    send_trial_ending_banner.ts
  lib/
    user_local_now.ts           # given user.tz, return their local date-time
    should_run_at.ts            # given (job, user, now), returns boolean
    idempotency.ts              # log lookup + write

src/db/schema/jobs_run_log.ts
src/db/schema/push_queue.ts
src/db/migrations/0003_cron.sql

src/routes/internal_cron.ts     # POST /v1/internal/cron — auth via X-Cron-Secret header

src/app.ts                      # register route

tests/cron/                     # one test file per job
.replit / replit-cron-config.md # docs for Replit cron setup
```

## `jobs_run_log` schema

```sql
id            bigserial PRIMARY KEY
job_name      text NOT NULL
user_id       uuid              -- nullable (some jobs aren't per-user)
run_for_date  date              -- the calendar date the job processed (in user tz)
ran_at        timestamptz NOT NULL DEFAULT now()
succeeded     boolean NOT NULL DEFAULT true
error         text
UNIQUE (job_name, user_id, run_for_date)
INDEX (job_name, ran_at DESC)
```

## `push_queue` schema

```sql
id                uuid PRIMARY KEY
user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
template          text NOT NULL  -- 'morning_cue', 'sunday_close', 'trial_ending'
payload           jsonb NOT NULL DEFAULT '{}'
scheduled_for     timestamptz NOT NULL
sent_at           timestamptz
attempts          int NOT NULL DEFAULT 0
last_error        text
INDEX (sent_at, scheduled_for)
```

## Acceptance criteria

- [ ] `POST /v1/internal/cron` is invokable only with the right `X-Cron-Secret` header (env: `CRON_SECRET`); 401 otherwise.
- [ ] Replit cron config calls this endpoint every 5 minutes (documented in `replit-cron-config.md`).
- [ ] On each run, runner enumerates users (chunked, 1000 at a time) and dispatches each job with `(user, now)` — but only if `should_run_at(job, user, now)` is true.
- [ ] `apply_streak_freezes` runs exactly once per user per local-day (idempotent via `jobs_run_log`).
- [ ] `generate_weekly_summary` runs exactly once per user per ISO-week-Sunday.
- [ ] `send_morning_cue_push` enqueues exactly one push per user per local-day at their cue minute (±5 min tolerance).
- [ ] `send_evening_cue_push` only runs Sundays; produces "The week closed. X of 7 days complete." with the correct X.
- [ ] `generate_day_30_insights` runs exactly once per user (forever) when they hit 30 distinct closed days.
- [ ] `refresh_monthly_freezes` runs once per user per month-of-the-year.
- [ ] `send_trial_ending_banner` flips a flag on `users.notification_prefs.banner` (or similar) on day 11 of trial — never sends a push.
- [ ] Per-job tests pass: each test sets up a user with a fixed tz + cue, calls the job with various `now` values, asserts fire/no-fire and idempotency.
- [ ] If any job throws, the runner logs `succeeded=false` and continues with other users — no whole-batch failure.

## Non-goals

- No actual push send (T-013).
- No actual insights generation (T-011).
- No retry queue for failed jobs in v1 — Replit cron will re-run in 5 min, idempotency prevents double-fire.
- No backfill tool for historical missed runs.

## Notes for the agent

- Use `Intl.DateTimeFormat` with `timeZone` to compute user-local date-time. No date-fns-tz dep.
- "Tolerance" for cue-time matching: jobs run every 5 min, so a cue at 07:30 fires when current run is between 07:30:00 and 07:34:59 in user tz. `should_run_at` rounds the user's cue to a 5-minute slot.
- For `generate_weekly_summary`: use ISO week (`YYYY-Www`). Drizzle has no built-in; compute in JS using the algorithm `(week of year per ISO 8601)`.
- The `generate_day_30_insights` stub: write a stub function in `src/domain/insights/generate.ts` returning `[]`. T-011 implements.
- The cron runner should NOT run synchronously for thousands of users in one request. Use `Promise.allSettled` over a batch of 100 users at a time, with a short timeout per user-job (1500ms). Whole runner has a hard 4-minute timeout.
- Replit scheduler: configure to hit `https://<replit-url>/v1/internal/cron` with header `X-Cron-Secret: $CRON_SECRET` every 5 minutes. Document in `replit-cron-config.md`.
- For local dev, expose a `npm run cron:tick` script that calls the runner once.
