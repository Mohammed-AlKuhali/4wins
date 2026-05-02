# T-055 — Telemetry — audit_events instrumentation

**Area:** ops
**Estimate:** 60 min
**Depends on:** T-006
**Implements PRD:** §5 (audit_events), §8 (privacy — no analytics on entry content)

## Goal

Wire client + server telemetry through the `audit_events` table. Used to debug retention drop-offs without ever logging entry content.

## What to build

1. **Client telemetry:** every screen-mount fires an `audit_events` write through a thin wrapper. Templates:
   - `screen_view` with `metadata={ screen, locale, mode }`
   - `onboarding_screen_completed` with `metadata={ screen, time_ms }`
   - `pillar_capture_started` / `pillar_capture_completed` with `metadata={ pillar, input_method, time_ms }`
   - `paywall_shown` / `paywall_action` with `metadata={ action: 'trial' | 'continue_free' | 'dismiss' }`
2. **Server telemetry:** every domain action (entry_created, day_closed, streak_reset, push_sent) writes audit_events as already specced in earlier tickets.
3. **Strict no-PII:** the telemetry helper rejects (TS-level) any metadata key that includes `text`, `raw_`, `email`, `identity`, `custom_tradition_text`. Compile-time guard.
4. **Sampling:** 100% in v1, reduce as needed.
5. **Retention:** the cron `cleanup_audit_events` (T-010) deletes events older than 90 days.
6. **Ops dashboard query book:** `docs/ops/telemetry-queries.md` with SQL to answer:
   - "What screen has the highest drop-off in onboarding?"
   - "What % of users log all 4 pillars on Day 0?"
   - "What % of trial users convert to paid?"
   - "What's the median time from screen open to pillar complete?"

## Files to create / modify

```
apps/mobile/lib/telemetry.ts                  # client wrapper
apps/mobile/app/_layout.tsx                   # auto-emit screen_view per route
apps/mobile/types/telemetry.d.ts              # compile-time type guard

src/routes/audit.ts                           # POST /v1/audit (only client uses)
src/domain/audit/append.ts
src/app.ts

docs/ops/telemetry-queries.md
__tests__ both sides
```

## Acceptance criteria

- [ ] Every screen-mount in mobile emits `screen_view` audit event.
- [ ] All entry creations / day closes write server-side audit events with PRD §5 metadata only (no content).
- [ ] Compile-time TS error if any caller tries to put `raw_text` / `email` / etc. in metadata.
- [ ] `POST /v1/audit` requires auth + rate-limited 30/min/user; rejects banned keys at runtime as defense in depth.
- [ ] `cleanup_audit_events` cron deletes >90 day events.
- [ ] Telemetry-queries doc has working SQL for all 4 listed questions.
- [ ] Tests: TS guard fails on banned key; runtime rejection works; queries return expected results on seeded data.

## Non-goals

- Third-party analytics (Mixpanel, Amplitude, PostHog) — banned per PRD §9.
- Real-time dashboard / Grafana integration (v1.5 if needed; SQL via Replit DB UI is sufficient).
- A/B testing infrastructure (v1.5).

## Notes for the agent

- The TS type guard: `type AuditMetadata<T extends Record<string, unknown>> = { [K in keyof T]: K extends \`${string}text${string}\` | \`raw_${string}\` | 'email' | ... ? never : T[K] }`. Caller provides metadata typed against this.
- The `metadata` keys allowed are: `screen, locale, mode, pillar, input_method, time_ms, action, banner, screen_from, screen_to, attempt_count, error_code`. Anything else is reviewed before allowing.
- All screen names are stable identifiers from `expo-router` paths — keep stable so queries don't break across releases.
- Event volume estimate: ~50-100 events per active daily user. At 1000 DAU = 100k/day. Postgres handles fine.
