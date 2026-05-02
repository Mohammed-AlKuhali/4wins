# Replit Agent commands — one per ticket, in sprint order

> Each line is a copy-pasteable Replit Agent input. Imported repo means Agent reads the referenced files directly. **Run them in order — dependencies are baked in.**

## Standing instruction (paste once at session start)

```
Whenever I ask you to implement a ticket, first read:
1. docs/tickets/README.md (conventions + dependency graph)
2. docs/03-brand.md §9 (rejection list — applies to all code)
3. The specific ticket file
4. Any PRD sections (docs/04-prd.md) referenced in the ticket header
5. Any brand bible sections (docs/03-brand.md) referenced in the ticket header

Then implement. Self-verify against the ticket's acceptance criteria before claiming completion. Run the tests. Do not silently substitute the stack — ask me first.
```

After you've pasted this once, the per-ticket commands below stay tight.

---

## Sprint 1 — backend foundation

```
Implement docs/tickets/backend/T-001-replit-setup.md.
```
```
Implement docs/tickets/backend/T-002-postgres-schema.md. T-001 must be merged first.
```
```
Implement docs/tickets/backend/T-003-auth-jwt.md. T-002 must be merged first.
```
```
Implement docs/tickets/backend/T-004-errors-ratelimit-health.md. T-001 must be merged first. (Can run in parallel with T-003.)
```
```
Implement docs/tickets/backend/T-005-user-endpoints.md. T-003 and T-004 must be merged first.
```

## Sprint 2 — backend domain + mobile foundation

```
Implement docs/tickets/backend/T-006-days-entries-api.md. T-005 must be merged.
```
```
Implement docs/tickets/mobile/T-021-expo-setup.md. (Independent of backend — can start any time.)
```
```
Implement docs/tickets/backend/T-007-ai-tag.md. T-006 must be merged.
```
```
Implement docs/tickets/backend/T-008-voice-transcribe.md. T-006 must be merged.
```
```
Implement docs/tickets/backend/T-009-streaks-engine.md. T-006 must be merged.
```
```
Implement docs/tickets/mobile/T-022-design-tokens.md. T-021 must be merged.
```
```
Implement docs/tickets/backend/T-010-cron-jobs.md. T-009 must be merged.
```

## Sprint 3 — mobile primitives

```
Implement docs/tickets/mobile/T-023-quad-component.md. T-022 must be merged.
```
```
Implement docs/tickets/mobile/T-024-pillar-glyphs.md. T-022 must be merged. (Can run in parallel with T-023.)
```
```
Implement docs/tickets/mobile/T-025-navigation.md. T-022 must be merged. (Can run in parallel with T-023, T-024.)
```
```
Implement docs/tickets/mobile/T-026-auth-flow.md. T-025 + backend T-003 must be merged.
```

## Sprint 4 — onboarding

```
Implement docs/tickets/mobile/T-027-onboarding-1.md. T-026 must be merged.
```
```
Implement docs/tickets/mobile/T-028-onboarding-2.md. T-027 must be merged.
```
```
Implement docs/tickets/mobile/T-029-day-zero.md. T-028 + T-023 + T-024 must be merged.
```

## Sprint 5 — daily app loop

```
Implement docs/tickets/mobile/T-030-home.md. T-023 + T-024 + backend T-006 must be merged.
```
```
Implement docs/tickets/mobile/T-031-pillar-capture-mental-physical.md. T-030 must be merged.
```
```
Implement docs/tickets/mobile/T-032-pillar-capture-spiritual.md. T-031 must be merged. (Parallel with T-033.)
```
```
Implement docs/tickets/mobile/T-033-pillar-capture-financial.md. T-031 must be merged. (Parallel with T-032.)
```
```
Implement docs/tickets/mobile/T-034-voice-overlay.md. T-031 + backend T-008 must be merged.
```
```
Implement docs/tickets/mobile/T-035-day-complete.md. T-030 must be merged.
```

## Sprint 6 — secondary surfaces

```
Implement docs/tickets/mobile/T-036-history.md. T-030 + backend T-006 must be merged.
```
```
Implement docs/tickets/mobile/T-037-weekly-close.md. T-030 must be merged. (Parallel with T-036, T-038.)
```
```
Implement docs/tickets/mobile/T-038-settings.md. T-030 + backend T-005 must be merged.
```
```
Implement docs/tickets/mobile/T-043-home-widget.md. T-023 must be merged.
```
```
Implement docs/tickets/mobile/T-044-health-integrations.md. T-031 must be merged.
```

## Sprint 7 — paywall + monetization

```
Implement docs/tickets/backend/T-011-insights-engine.md. T-006 + T-009 must be merged.
```
```
Implement docs/tickets/backend/T-012-subscription-iap.md. T-005 must be merged.
```
```
Implement docs/tickets/backend/T-013-push-notifications.md. T-005 must be merged.
```
```
Implement docs/tickets/mobile/T-041-day-30-paywall.md. T-030 + backend T-011 + backend T-012 must be merged.
```
```
Implement docs/tickets/mobile/T-042-subscription-manage.md. T-041 must be merged.
```
```
Implement docs/tickets/backend/T-014-account-deletion.md. T-005 must be merged.
```

## Sprint 8 — polish + ship

```
Implement docs/tickets/mobile/T-045-i18n.md. T-022 must be merged.
```
```
Implement docs/tickets/mobile/T-046-a11y.md. All screen tickets (T-027..T-038, T-041, T-042) must be merged.
```
```
Implement docs/tickets/ops/T-054-error-monitoring.md. T-001 + T-021 must be merged.
```
```
Implement docs/tickets/ops/T-055-telemetry.md. T-006 must be merged.
```
```
Implement docs/tickets/ops/T-051-app-store-connect.md. T-021 must be merged.
```
```
Implement docs/tickets/ops/T-052-play-console.md. T-021 must be merged. (Parallel with T-051.)
```
```
Implement docs/tickets/ops/T-053-testflight.md. T-051 must be merged.
```

---

## After every ticket — micro-checklist

1. Did Agent run the tests in the ticket?
2. Did all acceptance criteria check?
3. Did Agent silently substitute the stack? (If yes, push back; the ticket spec is binding.)
4. Did the diff include any items from the rejection list (`docs/03-brand.md §9`)?
5. If anything's wrong, ask Agent: *"This violated [criterion]. Fix without restarting."*

If a ticket's command consistently produces broken output, fall back to wrapping it with `_template.md` and inlining the missing context.
