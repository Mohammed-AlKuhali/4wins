# T-012 — Subscription / IAP receipt verification

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-005
**Implements PRD:** §3 Flow E + F (paywall, trial-to-paid), §6 (subscription endpoints)
**Brand bible:** §3 (no urgency timers, no struck-through prices, fair trial)

## Goal

Verify Apple App Store + Google Play receipts server-side, manage `subscription_status` transitions, support the 14-day trial that doesn't require a credit card upfront.

## What to build

1. `POST /v1/subscription/start_trial` — kicks off a 14-day trial. Updates `users.subscription_status='trial'`, `trial_ends_at = now() + 14 days`. Emits audit. No App Store receipt needed at this point — trial is server-controlled.
2. `POST /v1/subscription/redeem { receipt, platform }` — verify with Apple or Google. On success: `subscription_status='paid'`, `paid_until = receipt.expires_at`. Stores receipt for renewal verification.
3. `GET /v1/subscription/status` — returns current status, trial end, paid-through.
4. **Renewal cron (T-010 hook):** daily, for all `subscription_status='paid'` users, re-verify the receipt. If expired, transition to `expired`. If still active, update `paid_until`.
5. **Trial expiry cron (T-010 hook):** daily, for `subscription_status='trial'` users where `trial_ends_at < now()`: transition to `free`. Free tier kicks in (history capped to 30 days, paywalled insights blur).
6. **Webhooks (server-to-server notifications):**
   - Apple: `POST /v1/webhooks/apple` — App Store Server Notifications V2.
   - Google: `POST /v1/webhooks/google` — RTDN via Pub/Sub HTTP push.
   Update `subscription_status` based on event type (renew, cancel, refund, etc.).

## Files to create / modify

```
src/db/schema/iap_receipts.ts
src/db/migrations/0004_iap.sql

src/domain/subscription/
  start_trial.ts
  redeem_apple.ts             # App Store Server API verification
  redeem_google.ts            # Google Play Developer API verification
  state_machine.ts            # transition rules
  jwt_apple.ts                # ES256 signing for App Store API auth
  service_account_google.ts   # GCP service-account auth

src/routes/subscription.ts    # 3 endpoints
src/routes/webhooks.ts        # Apple + Google webhook receivers

src/cron/jobs/
  verify_paid_subscriptions.ts
  expire_trials.ts

src/app.ts

tests/subscription.test.ts
tests/webhooks.test.ts
```

## `iap_receipts` schema

```sql
id                  uuid PRIMARY KEY
user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
platform            text NOT NULL CHECK (platform IN ('ios','android'))
product_id          text NOT NULL                       -- 'me.4wins.yearly' / monthly
original_receipt    text NOT NULL                       -- raw, encrypted at rest if possible
purchase_token      text                                -- Google
transaction_id      text                                -- Apple
expires_at          timestamptz
last_verified_at    timestamptz
status              text NOT NULL CHECK (status IN ('active','expired','refunded','revoked'))
INDEX (user_id, status)
```

## Acceptance criteria

- [ ] `POST /v1/subscription/start_trial` requires auth. If user is already `trial` or `paid`, returns 409 `CONFLICT`. If `expired`/`canceled`, allows new trial only if previous trial ended >180 days ago (to prevent abuse) — log this rule clearly.
- [ ] `POST /v1/subscription/redeem` verifies the receipt against the right provider, stores it, transitions status.
- [ ] Apple verification uses the App Store Server API V2 (NOT the deprecated `verifyReceipt` endpoint). JWT auth via ES256 signing with `APPLE_PRIVATE_KEY`.
- [ ] Google verification uses Google Play Developer API v3 with the service-account JSON in `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
- [ ] `GET /v1/subscription/status` returns `{ status, trial_ends_at, paid_until, product_id? }`.
- [ ] Renewal cron transitions `paid → expired` when receipt expires + 7-day grace period.
- [ ] Trial expiry cron transitions `trial → free` when `trial_ends_at < now()`.
- [ ] Webhook endpoints verify signatures (Apple: JWS; Google: nothing — protected via Pub/Sub auth instead, but verify the audience).
- [ ] State machine rejects illegal transitions (e.g. `paid → trial` is illegal).
- [ ] Tests: trial start, trial double-start, valid Apple receipt, valid Google receipt, expired receipt, refund webhook, cancel webhook.
- [ ] No raw receipt data is logged.

## Non-goals

- No upgrade/downgrade flows (one product, one plan).
- No promo code redemption in v1 (Apple/Google handle that natively).
- No family sharing UI (Apple's iOS-level feature suffices).
- No proration logic.
- No win-back offers.

## Notes for the agent

- App Store Server API: https://developer.apple.com/documentation/appstoreserverapi. Use the production URL by default; switch to sandbox based on a server flag for testing.
- Apple V2 notifications come as a JWS; verify with Apple's root cert chain. Use `node-apple-receipt-verify` if you must, but prefer hand-rolled with `jose`.
- Google receipt: `purchaseToken` from the client; verify via `androidpublisher.purchases.subscriptions.get`.
- For server-to-server notifications, Google uses Pub/Sub HTTP push with OIDC token verification — verify the JWT `aud` matches our endpoint URL.
- Don't store the raw Apple JWS forever — store the decoded payload + a hash. The original isn't needed after first verify.
- Refund handling: when a refund webhook fires, transition status appropriately AND mark the user's data — but per PRD §9, we don't delete entries (they're still the user's data). Keep them readable.
- Product IDs:
  - iOS: `me.4wins.yearly` ($79/yr), `me.4wins.monthly` ($7.99/mo)
  - Android: same product IDs (Google allows same string)
- Trial fairness: per PRD §3, "no card needed for the trial" — so trial does NOT require an Apple/Google subscription to start. It's purely server-flagged. The user attaches a receipt only when converting at day 14.
