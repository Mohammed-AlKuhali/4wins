# T-014 — Account deletion (GDPR/DSR-compliant)

**Area:** backend
**Estimate:** 30 min
**Depends on:** T-005
**Implements PRD:** §6 (DELETE /me), §9 (privacy)
**Brand bible:** §3 (no guilt-on-leave)

## Goal

Provide a hard-delete path required for App Store + Play Store compliance and for users who want their data gone. The soft-delete from T-005 covers the immediate UX; a daily job converts soft-deleted accounts to hard deletes after a 30-day grace period.

## What to build

1. **30-day grace period.** A user soft-deleted via `DELETE /v1/me` (T-005) sits in a "deleted but recoverable" state for 30 days. During this window:
   - All data still exists.
   - Auth sessions are revoked, so they can't sign in.
   - A re-sign-in via Apple/Google with the SAME `apple_sub`/`google_sub` undoes the soft-delete and restores access (this is the "I changed my mind" path).
2. **Hard-delete cron** (`hard_delete_lapsed_accounts`) — runs daily at 03:00 UTC. For users with `deleted_at < now() - 30 days`, hard-delete:
   - All `entries`, `days`, `streaks`, `weekly_summaries`, `insights`, `push_tokens`, `auth_sessions`, `iap_receipts` for that user (cascades).
   - The `users` row itself.
   - Audit events for that user are anonymized: `user_id` set to null but rows kept (for ops debugging — never PII).
3. **Restore flow.** On Apple/Google sign-in (T-003), if a soft-deleted user matches the sub: clear `deleted_at`, restore email, restore tradition/cue/identity if still available, and sign them in.
4. **Immediate hard delete on request.** Add `DELETE /v1/me?immediate=true` for users who want immediate purge (legal requirement in some jurisdictions). Skips grace period.
5. **Test data export endpoint** (App Store privacy requirement): `GET /v1/me/export` returns a JSON file with all the user's data. Skip in v1 if scope-limited; flag for v1.1 if so.

## Files to create / modify

```
src/domain/users/
  hard_delete.ts
  restore.ts
  export.ts                    # optional in v1

src/cron/jobs/
  hard_delete_lapsed_accounts.ts

src/routes/me.ts               # extend with ?immediate=true and /export

src/domain/auth/
  upsert_user.ts               # extend to handle soft-deleted user re-sign-in

tests/account_deletion.test.ts
```

## Acceptance criteria

- [ ] After `DELETE /v1/me` (default), the user is soft-deleted: `deleted_at` set, sessions revoked, PII scrubbed, all entries/days/etc retained.
- [ ] `DELETE /v1/me?immediate=true` calls `hard_delete` directly. All data gone within seconds.
- [ ] The hard-delete cron processes only users with `deleted_at < now() - 30 days`. Run manually with `npm run cron:tick` and assert behavior.
- [ ] Re-signing in via Apple/Google with the same sub within 30 days clears `deleted_at` and restores the email field. Other PII (identity_statement) was scrubbed at soft-delete and is gone — that's expected.
- [ ] Re-signing in via the same sub after 30 days creates a fresh user (since the old row was hard-deleted).
- [ ] Audit events for the deleted user have `user_id` set to NULL but rows retained.
- [ ] After hard delete: querying any of the 8 user-owned tables for that `user_id` returns 0 rows.
- [ ] Tests: soft-delete, immediate hard-delete, lapsed hard-delete via cron, restore within 30d, sub-match after 30d.

## Non-goals

- No "deletion confirmation" workflow inside the app — the app's brand bible bans guilt-on-leave. The DELETE endpoint just deletes.
- No reactivation reminder emails.
- No data download wait time — `?immediate=true` is synchronous.
- No `/me/export` in v1 if it adds >30 min — punt to v1.1.

## Notes for the agent

- `ON DELETE CASCADE` on FKs handles most of the work. Manually delete `users` last — cascade does the rest.
- For audit events anonymization: `UPDATE audit_events SET user_id = NULL WHERE user_id = ?`. The `metadata` field of audit events should already be field-name-only per T-005, so it's safe.
- The "restore" path matters for trust: if a user soft-deletes and re-signs in within 30 days, they shouldn't lose their entries. Test this explicitly.
- Don't send any "your account is scheduled for deletion" email in v1 — we don't have email sending wired (no transactional email provider yet). v1.5 ticket if needed.
- App Store / Play Store privacy disclosures must reflect this 30-day grace + hard-delete-on-request capability.
