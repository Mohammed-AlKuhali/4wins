# 4Wins — Architecture Overview

## System Diagram

```
┌──────────────────────────────────┐
│  Mobile App (Expo / React Native)│
│  iOS + Android                   │
│  Bundle: me.4wins.app            │
└──────────┬───────────────────────┘
           │ HTTPS (JWT Bearer)
           ▼
┌──────────────────────────────────┐
│  Hono v4 REST API                │
│  Node 22 ESM — port 8080         │
│  Replit (container)              │
│                                  │
│  Routes: /v1/*                   │
│  Auth: HS256 JWT (jose)          │
│  Rate limit: in-memory           │
│  Logs: pino → stdout             │
│  Errors: Sentry                  │
└──────────┬───────────────────────┘
           │ postgres-js
           ▼
┌──────────────────────────────────┐
│  PostgreSQL (Replit managed)     │
│  DATABASE_URL env var            │
│  8 core tables + migrations      │
└──────────────────────────────────┘

External services (opt-in, no PII):
  Anthropic Claude Haiku  → pillar tagging
  OpenAI Whisper          → voice transcription
  Expo Push               → push notifications
  Apple IAP / Google IAP  → subscription receipts
  Sentry                  → error monitoring
```

## Data Flow: Entry Creation

```
1. User taps pillar quadrant
2. PillarCapture screen opens
3. User types or voice-records entry
4. POST /v1/ai/tag { text } → returns pillar + score
5. POST /v1/entries { pillar, text, source, score }
6. Server: create entry → recompute_day_state → streak recompute
7. Response: updated DayState
8. Client: refetch /v1/today → Quad re-renders
9. Widget sync: serialize QuadState → NativeModules.WidgetSync
```

## Data Flow: Cron (nightly)

```
POST /v1/internal/cron (X-Cron-Secret header)
  → daily_rollover (carry forward partial days)
  → streak recompute for all active users
  → apply_streak_freezes (consume freeze if eligible)
  → send evening cue push (8pm user-local)
  → send morning cue push (8am user-local)
  → drain_push_queue (batch Expo push calls)
  → expire_trials (trial_ends_at < now → free)
  → verify_paid_subscriptions (paidUntil < now → free)
  → hard_delete_lapsed_accounts (deleted_at > 30d)
  → generate_day_30_insights (day 30 milestone)
  → generate_weekly_summary (Friday evening)
  → refresh_monthly_freezes (1st of month)
```

## Auth Flow

```
App launch → check SecureStore for access_token
  ├─ valid JWT (< 1h) → proceed
  ├─ expired → POST /v1/auth/refresh with refresh_token → new pair
  └─ none / invalid → Welcome screen
       ├─ Apple Sign-In → identityToken → POST /v1/auth/apple
       └─ Google OAuth → idToken → POST /v1/auth/google
            └─ server: verify OIDC, upsert user, return { access_token, refresh_token }
```

## Subscription States

```
free → trial (POST /v1/subscription/start_trial)
     → paid  (POST /v1/subscription/redeem)
trial → paid  (IAP receipt)
      → free  (trialEndsAt expired via cron)
paid → free   (paidUntil expired via cron)
     → paid   (receipt renewal via webhook)
```

## Key Invariants

- No PII sent to AI providers (text content only, no user identifiers)
- Audit telemetry uses server-enforced allowlist (banned keys → 422)
- Streaks use Day 2 rule: day 1 never counts, no shame on reset
- All monetary operations are idempotent (receipt redemption deduped)
- Soft delete: 30d grace period before hard delete
- Widget data is derived from QuadState, no raw text ever written
