# Replit Cron Configuration

## Schedule

Every 5 minutes, Replit's Reserved VM scheduler should call:

```
POST https://<your-replit-app>.replit.app/v1/internal/cron
Header: X-Cron-Secret: <CRON_SECRET env var>
```

## Setup steps

1. Set `CRON_SECRET` as a Replit secret (a long random string).
2. In the Replit UI, go to **Scheduled jobs** (Reserved VMs only).
3. Add a new job:
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Command**: `curl -s -X POST https://<your-app-url>/v1/internal/cron -H "X-Cron-Secret: $CRON_SECRET"`
4. Alternatively, for dev: run `npm run cron:tick` to fire one cron pass immediately.

## Jobs dispatched per tick

| Job | When |
|-----|------|
| `apply_streak_freezes` | User-local 04:00 |
| `refresh_monthly_freezes` | User-local 00:01 on 1st |
| `generate_weekly_summary` | User-local Sunday evening cue |
| `send_morning_cue_push` | User-local cue time |
| `send_evening_cue_push` | User-local Sunday evening cue |
| `generate_day_30_insights` | Once, when user hits 30 closed days |
| `send_trial_ending_banner` | 3 days before trial ends |

## Idempotency

All jobs are idempotent via the `jobs_run_log` table. Re-running the cron within the same window is safe.
