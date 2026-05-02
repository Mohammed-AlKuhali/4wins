# T-005 — User endpoints (/me CRUD)

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-003, T-004
**Implements PRD:** §6 (User endpoints), §3 (Flow A onboarding settings)
**Brand bible:** none directly

## Goal

Implement the three `/me` endpoints that power onboarding (Flow A) and Settings (screen 18). After this ticket, the mobile client can read and update everything in the `users` table that's user-controllable.

## What to build

1. `GET /v1/me` — returns the current user's full profile (sans secrets).
2. `PATCH /v1/me` — partial update of: `tradition`, `custom_tradition_text`, `cue_label`, `cue_time_of_day`, `cue_time_local`, `identity_statement`, `notification_prefs`, `timezone`, `locale`.
3. `DELETE /v1/me` — soft-delete: sets `deleted_at`, scrubs PII (email → `deleted-<id>@4wins.invalid`, identity_statement → null, custom_tradition_text → null), revokes all auth_sessions, returns 204. The user's `entries` and `days` are NOT deleted (they're aggregate-anonymized in audit_events). Hard delete is T-014.
4. Zod schema for the PATCH body.
5. Tests covering: shape of GET, allowed PATCH fields, rejected fields (e.g. `email`, `subscription_status`, `created_at`), DELETE behavior.

## Files to create / modify

```
src/routes/me.ts
src/domain/users/
  shape_user.ts            # serializer (strips secrets, formats timestamps)
  validate_update.ts       # zod schema
  soft_delete.ts           # the delete logic

src/app.ts                 # register routes

tests/me.test.ts
```

## API shapes

### `GET /v1/me` response

```ts
{
  id: string;
  email: string;
  created_at: string;       // ISO
  tradition: 'christian'|'stoic'|'buddhist'|'secular'|'custom';
  custom_tradition_text: string | null;
  cue_label: string | null;
  cue_time_of_day: 'morning'|'midday'|'evening'|'before_bed'|'custom' | null;
  cue_time_local: string | null;   // 'HH:MM:SS'
  identity_statement: string | null;
  notification_prefs: { max_per_day: number };
  timezone: string;
  locale: string;
  subscription_status: 'free'|'trial'|'paid'|'expired'|'canceled';
  trial_ends_at: string | null;
  paid_until: string | null;
}
```

### `PATCH /v1/me` body

All fields optional, but the server rejects (with `VALIDATION`) any field not in the allowed set above.

### `DELETE /v1/me` response

`204 No Content`.

## Acceptance criteria

- [ ] `GET /v1/me` requires auth, returns the shape above.
- [ ] `PATCH /v1/me` accepts a partial body, validates, updates only allowed fields.
- [ ] PATCHing `email`, `created_at`, `subscription_status`, `apple_sub`, `google_sub` returns `VALIDATION` (those are server-managed).
- [ ] PATCHing `tradition='custom'` without `custom_tradition_text` is allowed (text can be added later); switching tradition away from `custom` clears `custom_tradition_text` to null automatically.
- [ ] `notification_prefs.max_per_day` must be 0, 1, or 2.
- [ ] `cue_time_of_day='custom'` requires `cue_time_local`. Otherwise `cue_time_local` is derived server-side from a default mapping.
- [ ] `timezone` is validated against IANA list (use `Intl.supportedValuesOf('timeZone')`).
- [ ] `locale` is validated as a BCP 47 tag.
- [ ] `DELETE /v1/me` soft-deletes, scrubs PII, revokes sessions. A subsequent `GET /v1/me` with the old token returns 401.
- [ ] Tests: 6 unit tests covering each acceptance bullet group.
- [ ] Audit events: every PATCH writes an `audit_events` row with `event='user_updated'` and `metadata={ fields: [...] }` (field names only, NOT values, for privacy).

## Non-goals

- No email change in v1 (privacy + auth-provider-bound).
- No avatar / display name (the brand explicitly omits these).
- No "Profile" tab (settings only).
- No hard delete (T-014).

## Notes for the agent

- The cue-time default mapping (when `cue_time_of_day` is not `'custom'`):
  - `morning` → 07:30
  - `midday` → 12:30
  - `evening` → 19:00
  - `before_bed` → 22:00
- These are local times; the cron job (T-010) translates to UTC using `users.timezone`.
- For soft delete: do not use Drizzle's `delete()`. Use `update({ deleted_at: now(), email: ..., ... })`.
- `requireAuth` middleware should already filter out users where `deleted_at IS NOT NULL` — confirm in T-003 review.
- The shape_user serializer is also used in T-003 auth response — refactor T-003's user serialization to use this if not already shared.
