# T-004 — Error envelope, rate limits, health

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-001
**Implements PRD:** §6 (errors), §8 (health, NFRs)
**Brand bible:** none directly

## Goal

Standardize how every endpoint returns errors, apply rate limits per the PRD, and expand the health endpoint to include DB + AI provider checks. After this ticket, every later route uses these middlewares without re-implementing them.

## What to build

1. **Error envelope.** A `throwApiError(code, message, status)` helper + a Hono error handler that catches anything and returns `{ error: { code, message } }` with the right HTTP status. Codes per PRD §6: `AUTH_REQUIRED`, `AUTH_EXPIRED`, `RATE_LIMITED`, `VALIDATION`, `NOT_FOUND`, `SERVER_ERROR`. Adds `FORBIDDEN`, `CONFLICT`.
2. **Validation middleware.** A `validate(zodSchema)` Hono middleware that returns `VALIDATION` errors with field details when a request body fails schema.
3. **Rate limits.** Per PRD: auth 10/min/IP, write 60/min/user, transcribe 30/min/user. Use in-memory + DB-backed sliding window (in-memory for fast path, DB for cross-instance correctness on Replit).
4. **Health endpoint enhanced.** `GET /v1/health` returns `{ status, db, ai }` where each is `'ok'` or `'degraded'`. Hits the DB (`SELECT 1`) and pings Anthropic + OpenAI APIs (cached 30s).
5. **Request logging.** Structured JSON log per request: `{ ts, method, path, status, duration_ms, user_id?, error_code? }`. No request bodies (privacy). Use `pino` minimal.
6. **CORS.** Permissive for `*` only on `/v1/auth/*` and `/v1/health` — everything else has no CORS (mobile app is the only client).

## Files to create / modify

```
src/lib/errors.ts                   # throwApiError, error codes enum, HTTP code map
src/lib/logger.ts                   # pino instance
src/middleware/error_handler.ts     # Hono onError + serializer
src/middleware/validate.ts          # zod schema → middleware
src/middleware/rate_limit.ts        # sliding-window rate limiter
src/middleware/request_log.ts       # one log line per request

src/db/schema/rate_limits.ts        # new tiny table
src/db/migrations/0002_rate_limits.sql

src/routes/health.ts                # expanded
src/app.ts                          # wire middlewares globally + per-route limits

tests/errors.test.ts
tests/rate_limit.test.ts
tests/health.test.ts
```

## `rate_limits` schema

```sql
id          bigserial PRIMARY KEY     -- exception to UUID rule (high write, never queried by id)
key         text NOT NULL              -- e.g. 'auth:ip:1.2.3.4' or 'write:user:<uuid>'
window_at   timestamptz NOT NULL       -- truncated to minute
count       int NOT NULL DEFAULT 1
UNIQUE (key, window_at)
INDEX (key, window_at DESC)
```

## Acceptance criteria

- [ ] Every error response matches the PRD envelope exactly.
- [ ] Throwing `throwApiError('NOT_FOUND', '...', 404)` from inside any handler reaches the client unchanged.
- [ ] Unhandled exception → `SERVER_ERROR` 500, logged with stack but stack is NOT in the response body.
- [ ] `/v1/auth/*` enforces 10/min/IP. 11th request in a minute returns 429 with `Retry-After`.
- [ ] Authenticated write endpoints enforce 60/min/user (configurable; tested against a single test user).
- [ ] `/v1/voice/transcribe` (when wired in T-008) will use a `30/min/user` limit — verify the middleware exposes `transcribeLimiter` correctly.
- [ ] `GET /v1/health` returns 200 with `{ status: 'ok', db: 'ok', ai: 'ok' }` when all healthy.
- [ ] If DB fails, health returns 200 (still alive) but `db: 'degraded'` and `status: 'degraded'`.
- [ ] If Anthropic ping fails, `ai: 'degraded'`.
- [ ] Logs are single-line JSON, no request bodies, parseable by Replit's log viewer.
- [ ] CORS preflight succeeds only for `/v1/auth/*` and `/v1/health`. Other endpoints return 405 on OPTIONS.

## Non-goals

- No structured tracing (OTel) in v1 — Replit logs are sufficient.
- No request-body sampling.
- No per-endpoint custom limits beyond the three categories.
- No metrics endpoint (Prometheus / etc).

## Notes for the agent

- Sliding-window rate limiter: hybrid in-memory + DB. In-memory `Map<key, { count, expires }>` is fast path; DB is source of truth across pod restarts. Increment in-memory eagerly; flush to DB every 10s OR on every 5th hit, whichever is sooner. On lookup miss in-memory, read from DB.
- Don't use `express-rate-limit` (we're not on Express).
- `pino` config: level from env, structured output, no pretty-print in prod.
- Health endpoint never requires auth.
- Rate limit error must include `Retry-After` header in seconds.
- Validation error format: `{ error: { code: 'VALIDATION', message: '...', fields: { path: 'reason' } } }`. The `fields` object is the only allowed extension.
- The Anthropic + OpenAI health ping: a HEAD or minimal GET request to their public health endpoints, NOT a full LLM call. Cache the result for 30s to avoid hammering them.
