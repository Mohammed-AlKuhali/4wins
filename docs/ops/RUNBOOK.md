# 4Wins Ops Runbook

## Quick health check

```bash
curl https://api.4wins.me/v1/health
# {"status":"ok","db":"ok","ai":"ok"}
```

Anything other than `ok` → see sections below.

---

## Architecture overview

| Layer | Technology | Notes |
|---|---|---|
| API | Node 22, Hono v4, ESM | Port 8080 |
| DB | PostgreSQL via Drizzle ORM | Replit managed Postgres |
| Auth | JWT RS256, Apple + Google IdToken | 15m access / 30d refresh |
| AI | OpenAI gpt-4o | voice transcription + insights |
| Notifications | Expo Push | external push gateway |
| Mobile | Expo SDK 53, expo-router v4 | iOS + Android |

---

## Environment variables

| Key | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `JWT_SECRET` | yes | Symmetric HMAC secret for JWT |
| `OPENAI_API_KEY` | yes | OpenAI API key |
| `APPLE_TEAM_ID` | yes | Apple developer team ID |
| `APPLE_CLIENT_ID` | yes | Apple service ID |
| `GOOGLE_CLIENT_ID` | yes | Google OAuth client ID |
| `SENTRY_DSN_BACKEND` | no | Sentry DSN for server |
| `GIT_SHA` | no | Injected at deploy time |
| `PORT` | no | Default 8080 |

---

## Database

### Migrations

```bash
npm run db:migrate   # applies pending Drizzle migrations
npm run db:generate  # generates migration files from schema changes
```

Migration files live in `src/db/migrations/`.

Never edit migration files after they have been applied to production.

### Tables

| Table | Purpose |
|---|---|
| `users` | account + preference data |
| `refresh_tokens` | active refresh token store |
| `days` | daily Quad records |
| `entries` | individual pillar logs |
| `audit_events` | client telemetry (no PII) |
| `notifications` | push token registry |
| `subscription_events` | App Store / Play webhook log |

---

## Deployment

The app is deployed on Replit. Publishing via the Replit UI triggers a build and promotion to the `.replit.app` domain.

### Production checks

1. Health endpoint returns `{"status":"ok","db":"ok","ai":"ok"}`
2. Auth endpoint returns 401 with no JWT
3. No 5xx in Sentry in first 5 minutes

---

## Incident playbook

### DB connection errors

- Check `DATABASE_URL` is set and reachable
- Run `npm run db:migrate` if tables are missing
- Restart the workflow if pool exhaustion suspected

### AI endpoint errors

- Verify `OPENAI_API_KEY` is valid
- Check OpenAI status at https://status.openai.com
- Voice transcription degrades gracefully (returns HTTP 503)

### Auth failures

- Verify Apple / Google tokens are not expired
- Check JWT_SECRET matches across all instances

### Notifications not delivered

- Check Expo push gateway at https://expo.dev/notifications
- Re-register push tokens by opening the app

---

## Streak freeze cron

The cron job at `POST /v1/internal/cron/apply-streak-freezes` runs daily at 00:05 UTC.

It is protected by `INTERNAL_CRON_SECRET` header and should only be called by the platform scheduler.

---

## Data retention

| Data | Retention |
|---|---|
| Entries + days | Forever for paid users, 30 days for free |
| Deleted accounts | 30 days soft-delete, then purged |
| Audit events | 90 days rolling |
| Push tokens | Removed when user deletes account |

---

## Support escalation

1. Check Sentry for stack trace
2. Check request logs for correlation ID
3. Check `audit_events` table for client-reported context
