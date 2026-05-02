# 4Wins

Full-stack daily-discipline app: Node 22/Hono v4 backend + Expo React Native mobile.

---

## Backend

### Stack

- **Runtime**: Node 22 ESM (`"type":"module"`)
- **Framework**: Hono v4 + @hono/node-server (port 8080)
- **ORM**: Drizzle ORM + postgres-js
- **Database**: Replit PostgreSQL (DATABASE_URL)
- **Auth**: jose (JWT/JWKS), Apple Sign-In, Google Sign-In
- **AI**: @anthropic-ai/sdk (Claude Haiku pillar tagging), openai (Whisper transcription)
- **Validation**: Zod
- **Logging**: pino
- **Tests**: Vitest (79 tests, all passing)
- **Observability**: Sentry (backend) — see `docs/ops/SENTRY.md`

### Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | /v1/health | Health check |
| POST | /v1/auth/apple | Apple Sign-In |
| POST | /v1/auth/google | Google Sign-In |
| POST | /v1/auth/refresh | Refresh access token |
| GET | /v1/me | Get current user |
| PATCH | /v1/me | Update user preferences |
| DELETE | /v1/me | Soft-delete account |
| GET | /v1/today | Today's Quad + entries |
| POST | /v1/entries | Create entry |
| PATCH | /v1/entries/:id | Update entry |
| DELETE | /v1/entries/:id | Delete entry |
| POST | /v1/ai/tag | AI pillar tagger |
| POST | /v1/voice/transcribe | Whisper transcription |
| GET | /v1/streak | Streak data |
| GET | /v1/insights | Monthly insights |
| POST | /v1/subscription/start_trial | Start 14-day trial |
| POST | /v1/subscription/redeem | Redeem IAP receipt |
| GET | /v1/subscription/status | Subscription status |
| POST | /v1/webhooks/apple | App Store webhook |
| POST | /v1/webhooks/google | Play Store webhook |
| POST | /v1/notifications/register | Register push token |
| DELETE | /v1/notifications/unregister | Unregister push token |
| POST | /v1/internal/cron | Cron trigger (secret-gated) |
| POST | /v1/audit | Client telemetry (PII-free allowlist) |

### Migrations

Migrations live in `src/db/migrations/`. Run: `npm run db:migrate`

Never edit migration files after applied to production.

### Env vars

| Var | Required | Purpose |
|-----|----------|---------|
| DATABASE_URL | yes | Replit Postgres |
| JWT_SECRET | yes | JWT signing |
| ANTHROPIC_API_KEY | no | Claude Haiku |
| OPENAI_API_KEY | no | Whisper |
| APPLE_BUNDLE_ID | no | Apple Sign-In |
| APPLE_TEAM_ID | no | Apple Sign-In |
| APPLE_KEY_ID | no | Apple Sign-In |
| APPLE_PRIVATE_KEY | no | Apple Sign-In + IAP |
| GOOGLE_CLIENT_ID_IOS | no | Google Sign-In |
| GOOGLE_CLIENT_ID_ANDROID | no | Google Sign-In |
| EXPO_ACCESS_TOKEN | no | Expo push |
| CRON_SECRET | no | Cron auth |
| SENTRY_DSN_BACKEND | no | Sentry DSN |
| GIT_SHA | no | Release tag for Sentry |

---

## Mobile (`apps/mobile/`)

### Stack

- **Framework**: Expo SDK 53, expo-router v4
- **React Native**: 0.76
- **Animation**: react-native-reanimated 3
- **State**: @tanstack/react-query
- **i18n**: i18next (en, ar, es)
- **Auth**: Apple Sign-In + Google OAuth
- **Audio**: expo-av (voice capture → Whisper)
- **Bundle ID**: `me.4wins.app`

### Design tokens (brand bible §4)

| Token | Value |
|-------|-------|
| Dark bg | `#0E0E0C` |
| Dark surface | `#15140F` |
| Dark text | `#FAF7F2` |
| Mental | `#2E4156` |
| Financial | `#7C5F26` |
| Spiritual | `#B8A47E` |
| Physical | `#A04428` |
| Display font | Fraunces 300 Light |
| Body font | IBM Plex Sans |
| Numeric font | IBM Plex Mono |

### Screen structure

```
app/
  index.tsx              → auth gate, redirect
  _layout.tsx            → QueryClient, ThemeProvider, i18n
  (onboarding)/
    welcome.tsx           → Apple/Google sign-in
    pillars.tsx           → "Four wins. Every day."
    tradition.tsx         → pick Spiritual tradition
    identity.tsx          → identity statement
    cue.tsx               → daily cue time
    notifications.tsx     → push opt-in
    day-zero.tsx          → first 4 entries
    first-close.tsx       → first Quad closed
  (app)/
    home.tsx              → main Quad screen
    pillar/[pillar].tsx   → pillar capture router
    history.tsx           → 30-day grid
    history/[date].tsx    → day detail
    weekly/[isoWeek].tsx  → week summary
    settings.tsx          → settings root
    settings/tradition.tsx
    settings/cue.tsx
    settings/identity.tsx
    settings/custom-tradition.tsx
  (modals)/
    voice.tsx             → voice record overlay
    paywall.tsx           → paywall modal
    subscription.tsx      → subscription manage
```

### Running the mobile app

```bash
cd apps/mobile
npx expo start
```

Requires EAS account for device builds. See `docs/ops/APP_STORE.md`.

---

## Ops docs

| File | Contents |
|------|---------|
| `docs/ops/RUNBOOK.md` | Incident playbook, DB ops, cron |
| `docs/ops/PRIVACY.md` | PII policy, data retention, App Store disclosures |
| `docs/ops/SENTRY.md` | Sentry setup, privacy filters, alert rules |
| `docs/ops/TELEMETRY.md` | Audit endpoint, event types, allowlist, SQL queries |
| `docs/ops/APP_STORE.md` | App Store / Play submission checklist, EAS commands |

---

## Architecture notes

- All PKs are text UUID (`crypto.randomUUID()`), except `rate_limits` (bigserial)
- Soft delete: users get `deleted_at` set; hard delete after 30 days via cron
- Idempotency: `POST /v1/entries` supports `Idempotency-Key` header (60s TTL)
- AI tagging: LRU cache (1000 entries, 5 min TTL), heuristic fallback on error
- Streaks: Day 2 rule — first complete day doesn't count; zero-shame resets
- No PII sent to Anthropic or OpenAI (only text content / audio binary)
- Audit telemetry: server-enforced key allowlist — any banned key returns 422
- Theme: time-based dark/light auto-switch (dark before 6am and after 6pm)
