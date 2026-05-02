# T-003 — Apple + Google Sign-In + JWT middleware

**Area:** backend
**Estimate:** 90 min
**Depends on:** T-002
**Implements PRD:** §6 (auth endpoints), §0 resolved decision #2
**Brand bible:** none directly

## Goal

Ship server-side Apple + Google Sign-In: client sends an `id_token` from native sign-in, server verifies it, upserts the user, returns our own JWT. Plus a JWT auth middleware that every later authenticated route uses.

## Context

Per PRD resolved decisions, Apple + Google Sign-In are the **only** auth methods. No email+password, no magic links. The mobile client (T-026) handles the native sign-in UI and gets an `id_token`; this ticket validates that token and issues our session JWT.

## What to build

1. `POST /v1/auth/apple` — verify Apple `id_token` against Apple's JWKs, upsert user by Apple sub or email, issue our JWT.
2. `POST /v1/auth/google` — same for Google. Verify against Google's certs.
3. `DELETE /v1/auth/session` — invalidate the JWT on the client (server-side just returns 204; we use short-lived JWTs + refresh).
4. JWT issuance: short-lived access token (1h) + long-lived refresh token (60d) stored in DB (`auth_sessions` table).
5. `requireAuth` Hono middleware that validates the access token and attaches `c.var.userId` to the request.
6. `POST /v1/auth/refresh` — exchange refresh token for new access token.
7. Tests for: valid Apple token → user, valid Google token → user, mismatched audience → 401, expired token → 401, missing/invalid header → 401.

## Files to create / modify

```
src/db/schema/auth_sessions.ts         # new table
src/db/migrations/0001_auth_sessions.sql

src/domain/auth/
  apple.ts                # Apple token verification (jose, JWKs)
  google.ts               # Google token verification (jose, JWKs)
  jwt.ts                  # our own JWT issue/verify
  refresh.ts              # refresh token rotation logic
  upsert_user.ts          # idempotent user creation/update from sign-in payload

src/routes/auth.ts        # the four endpoints

src/middleware/require_auth.ts

src/app.ts                # register auth routes, mount requireAuth conditionally

tests/auth.test.ts
```

## `auth_sessions` schema

```sql
id              uuid PRIMARY KEY
user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
refresh_token   text NOT NULL UNIQUE      -- random, 256-bit, never returned after issue
expires_at      timestamptz NOT NULL
revoked_at      timestamptz
device_label    text                       -- 'iOS - John's iPhone' if available
created_at      timestamptz NOT NULL DEFAULT now()
last_used_at    timestamptz
INDEX (user_id)
```

## Acceptance criteria

- [ ] `POST /v1/auth/apple` with a valid `id_token` returns `{ access_token, refresh_token, user }` and creates a user if missing.
- [ ] `POST /v1/auth/google` same behavior.
- [ ] Apple token verification checks: `iss=https://appleid.apple.com`, `aud` matches our bundle id, signature against Apple JWKs (cached 12h), `exp` valid.
- [ ] Google token verification checks: `iss` is `accounts.google.com` or `https://accounts.google.com`, `aud` matches one of our two `GOOGLE_CLIENT_ID_*` envs, signature against Google certs, `exp` valid.
- [ ] User is upserted by `apple_sub` or `google_sub` (added as nullable columns on `users` in this ticket's migration), falling back to email if sub absent. `email` is required.
- [ ] `requireAuth` middleware: missing header → 401, invalid token → 401, expired token → 401 with `error.code='AUTH_EXPIRED'`.
- [ ] `POST /v1/auth/refresh` rotates the refresh token (old one revoked, new one issued).
- [ ] `DELETE /v1/auth/session` revokes the current refresh token and returns 204.
- [ ] All 5 test cases in §What to build pass.
- [ ] No secrets in error messages. Even on misconfig, errors say `AUTH_FAILED` not "Apple key X not found."

## Non-goals

- No password reset (no passwords).
- No email verification (Apple/Google did it).
- No 2FA in v1.
- No social account linking (one user = one Apple OR one Google sub for now).
- No session list / revoke-other-sessions UI in v1.

## Notes for the agent

- Use `jose` (npm) for JWT verification + JWKS caching. Don't use `jsonwebtoken`.
- Apple's JWKs URL: `https://appleid.apple.com/auth/keys`.
- Google's JWKs URL: `https://www.googleapis.com/oauth2/v3/certs`.
- Apple sign-in uses ES256 with the `APPLE_PRIVATE_KEY` for *server-to-Apple* token exchanges; we don't need that for verifying client `id_token`s, only for revocation. Skip revocation in v1.
- Refresh tokens are random 256-bit secrets, NOT JWTs. Store hashed (sha256) in DB. Compare on use. Issue new one on use; revoke old.
- Access token JWT payload: `{ sub: user.id, exp, iat, type: 'access' }`. Sign with `JWT_SECRET` HS256.
- The Google client sends two possible audiences (iOS and Android); our verify accepts either.
- Add `apple_sub text UNIQUE` and `google_sub text UNIQUE` nullable columns to `users` in this ticket's migration.
- Error codes use the PRD §6 envelope: `{ error: { code: 'AUTH_REQUIRED', message: 'Sign in required' } }`.
