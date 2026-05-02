# 4Wins Backend

Node 22 + Hono v4 REST API for the 4Wins daily-discipline app.

## Stack

- **Runtime**: Node 22 ESM (`"type":"module"`)
- **Framework**: Hono v4 + @hono/node-server (port 8080)
- **ORM**: Drizzle ORM + postgres-js
- **Database**: Replit PostgreSQL (DATABASE_URL)
- **Auth**: jose (JWT/JWKS), Apple Sign-In, Google Sign-In
- **AI**: @anthropic-ai/sdk (Claude Haiku 4.5 pillar tagging), openai (Whisper transcription)
- **Validation**: Zod
- **Logging**: pino
- **Tests**: Vitest (79 tests, all passing)

## Migrations

Migrations are written manually (drizzle-kit generate fails with .js imports).

| # | File | Contents |
|---|------|----------|
| 0 | `0000_init.sql` | All 8 core tables |
| 1 | `0001_auth_sessions.sql` | Auth sessions |
| 2 | `0002_rate_limits.sql` | Rate limits |
| 3 | `0003_idempotency_keys.sql` | Idempotency keys |
| 4 | `0004_cron_iap.sql` | jobs_run_log, push_queue, iap_receipts |

Run: `npm run db:migrate`

## Routes

| Method | Path | Ticket |
|--------|------|--------|
| GET | /v1/health | T-001 |
| POST | /v1/auth/apple | T-003 |
| POST | /v1/auth/google | T-003 |
| POST | /v1/auth/refresh | T-003 |
| GET | /v1/me | T-005 |
| PATCH | /v1/me | T-005 |
| DELETE | /v1/me | T-005, T-014 |
| GET | /v1/today | T-006 |
| POST | /v1/entries | T-006 |
| PATCH | /v1/entries/:id | T-006 |
| DELETE | /v1/entries/:id | T-006 |
| POST | /v1/ai/tag | T-007 |
| POST | /v1/voice/transcribe | T-008 |
| GET | /v1/streak | T-009 |
| GET | /v1/insights | T-011 |
| POST | /v1/subscription/start_trial | T-012 |
| POST | /v1/subscription/redeem | T-012 |
| GET | /v1/subscription/status | T-012 |
| POST | /v1/webhooks/apple | T-012 |
| POST | /v1/webhooks/google | T-012 |
| POST | /v1/notifications/register | T-013 |
| DELETE | /v1/notifications/unregister | T-013 |
| POST | /v1/internal/cron | T-010 |

## Cron

The cron runner is triggered via `POST /v1/internal/cron` with header `X-Cron-Secret`. See `replit-cron-config.md`.

Dev: `npm run cron:tick` fires one pass immediately.

## Env vars (secrets)

| Var | Required | Purpose |
|-----|----------|---------|
| DATABASE_URL | yes | Replit Postgres |
| JWT_SECRET | yes | JWT signing |
| ANTHROPIC_API_KEY | no | Claude Haiku pillar tagging |
| OPENAI_API_KEY | no | Whisper transcription |
| APPLE_BUNDLE_ID | no | Apple Sign-In |
| APPLE_TEAM_ID | no | Apple Sign-In |
| APPLE_KEY_ID | no | Apple Sign-In |
| APPLE_PRIVATE_KEY | no | Apple Sign-In + IAP |
| GOOGLE_CLIENT_ID_IOS | no | Google Sign-In |
| GOOGLE_CLIENT_ID_ANDROID | no | Google Sign-In |
| EXPO_ACCESS_TOKEN | no | Expo Push notifications |
| CRON_SECRET | no | Cron endpoint auth |
| PUSH_DISABLED | no | Set to "true" to disable all pushes |

## Architecture notes

- All PKs are text UUID (`crypto.randomUUID()`), except `rate_limits` (bigserial) and `jobs_run_log` (bigserial)
- Soft delete: users get `deleted_at` set; hard delete after 30 days via cron
- Idempotency: `POST /v1/entries` supports `Idempotency-Key` header (60s TTL)
- AI tagging: LRU cache (1000 entries, 5 min TTL), fallback heuristic on Anthropic error
- Streaks: Day 2 rule — first complete day doesn't count; zero-shame resets
- No PII sent to Anthropic or OpenAI (only text content / audio binary)
