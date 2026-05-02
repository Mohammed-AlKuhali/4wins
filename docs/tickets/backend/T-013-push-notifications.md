# T-013 — Push notifications (Expo Push API)

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-005
**Implements PRD:** §6 (notification endpoints), §7 (push jobs), §3 Flow B (cue push)
**Brand bible:** §3 (push voice — invitational, never accusatory)

## Goal

Implement push token registration + the Expo Push send pipeline that drains the `push_queue` from T-010. Approved templates only — no ad-hoc push sending.

## What to build

1. `POST /v1/notifications/register` — store/update an Expo push token.
2. `DELETE /v1/notifications/unregister` — remove a token (e.g. on sign-out).
3. **Push sender:** `sendPush(userId, template, payload)` — looks up active tokens, calls Expo Push API, handles errors (invalid token → soft-delete it). Uses the brand-bible-approved copy templates.
4. **Push queue drainer (cron):** runs every minute, picks up `push_queue` rows where `scheduled_for <= now()` AND `sent_at IS NULL`, sends, marks sent. Capped at 1000/run.
5. **Approved templates only:** a frozen set in `src/domain/push/templates.ts`. Templates accept payload variables but the body string is brand-vetted.
6. **De-dup:** never send two pushes from the same template to the same user within 4 hours.
7. **Per-user rate cap:** never send more than `notification_prefs.max_per_day` pushes to a user in their local day.

## Files to create / modify

```
src/domain/push/
  templates.ts                # frozen template strings
  send.ts                     # the sender
  drain_queue.ts              # called by cron
  expo_client.ts              # Expo Push API wrapper

src/routes/notifications.ts   # register / unregister

src/cron/jobs/
  drain_push_queue.ts

src/app.ts

tests/push.test.ts
```

## Approved templates (source of truth)

```ts
// src/domain/push/templates.ts
export const TEMPLATES = {
  morning_cue: {
    title: '4Wins',
    body: "Coffee's brewing. Your 4Wins is ready.",
    sound: 'default',
  },
  afternoon_nudge: {
    title: '4Wins',
    body: 'Two of four. Ten minutes.',
    sound: null,                   // silent — daytime only
  },
  sunday_close: {
    title: '4Wins',
    body: 'The week closed. {days_complete} of 7 days complete.',
    sound: 'default',
  },
  trial_ending: {
    title: '4Wins',
    body: 'Your trial ends in {days_remaining} days.',
    sound: null,
  },
} as const;
```

**These are the ONLY templates.** Adding a new one requires a new ticket + brand review.

**Banned strings (will fail CI lint in T-055):** `"streak"` + `"!"`, `"don't"` + `"break"`, `"last chance"`, `"hurry"`.

## Acceptance criteria

- [ ] `POST /v1/notifications/register { token, platform }` upserts into `push_tokens`. Same token for different user moves it to the new user.
- [ ] `DELETE /v1/notifications/unregister` removes the row.
- [ ] `sendPush` resolves variables in the template body (e.g. `{days_complete}` → `6`).
- [ ] `sendPush` honors `users.notification_prefs.max_per_day` — if the user has already received their cap today (in their tz), the call is a no-op and logs `cap_reached`.
- [ ] `sendPush` honors 4-hour de-dup per template per user.
- [ ] On Expo response with `DeviceNotRegistered`, the sender removes the token.
- [ ] On Expo response with `MessageRateExceeded`, the sender retries with backoff.
- [ ] `drain_push_queue` runs every minute, processes up to 1000 rows, marks them sent.
- [ ] Push body text never includes any of the banned strings (assert in tests by iterating templates).
- [ ] Tests: 8 cases covering register/unregister, send happy path, rate cap, de-dup, banned-string check, DeviceNotRegistered handling.

## Non-goals

- No rich notifications (image, action buttons) in v1 — plain title+body.
- No category-based grouping (all notifications are "4Wins").
- No FCM / APNs direct integration (we use Expo Push as the abstraction).
- No localized push templates in v1 (T-045 will add later — for now, English only).

## Notes for the agent

- Use Expo's published HTTP API: `POST https://exp.host/--/api/v2/push/send` with auth header `Authorization: Bearer {EXPO_ACCESS_TOKEN}`.
- Expo accepts batches of 100 messages per request. The drainer should batch.
- "Local day" calculation uses `users.timezone`. Use the same `Intl.DateTimeFormat` helper as T-009/T-010.
- The 4-hour de-dup state lives in `audit_events` — write `event='push_sent'` with `metadata={ template, user_local_day }` on each send, query for previous send within 4h before sending.
- For `morning_cue`, the cron in T-010 enqueues at the user's local cue minute. The drainer fires it within 1 min.
- For `sunday_close`, the cron enqueues only on Sunday at the user's evening cue.
- Banned-string check should be a unit test that imports `TEMPLATES` and asserts none of them contain banned substrings (case-insensitive).
- Apple sound key: `default` triggers system sound. `null` means no sound. iOS users in Do-Not-Disturb still see the banner if respect-DND is off; we don't override that.
- Add a `kill_switch` env var `PUSH_DISABLED=true` that short-circuits all sends (for incident response).
