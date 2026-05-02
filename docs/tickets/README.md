# Phase 5 — Tickets

> Each ticket is a self-contained spec that becomes a single Replit Agent prompt in Phase 6. Sized to fit one Agent session (≈30–90 min of work).

---

## How to use this directory

1. **One ticket = one Replit Agent prompt.** Copy the ticket body into Replit Agent (Phase 6 will produce the wrapped/optimized prompt versions in `docs/prompts/`).
2. **Respect the dependency graph.** Tickets list `depends on:` upstream tickets. Don't start a ticket until its deps are merged.
3. **Every ticket references brand bible §9 (the rejection list).** Before merging the agent's output, run that checklist against the diff.
4. **Acceptance criteria are binding.** If they aren't all checked, the ticket isn't done — even if the agent says it is.

## Ticket format

```
# T-NNN — <title>

**Area:** backend / mobile / ops
**Estimate:** 30 / 60 / 90 min agent session
**Depends on:** T-XXX, T-YYY (or "none")
**Implements PRD:** §X.Y, §A.B
**Brand bible:** §X, §Y

## Goal
What this ticket produces and why.

## Context
Only the surrounding context the agent needs.

## What to build
Specific list.

## Files to create / modify
- path/to/file.ts (new)

## Acceptance criteria
- [ ] testable item

## Non-goals
- explicitly out of scope for this ticket

## Notes for the agent
- gotchas, references
```

---

## The dependency graph (high-level)

```
                            ┌──────────────────────┐
                            │ T-001 Replit + repo  │
                            └──────┬───────────────┘
                                   │
                        ┌──────────▼───────────┐
                        │ T-002 Postgres schema │
                        └──────────┬───────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌────────────────┐       ┌───────────────────┐      ┌─────────────────┐
│ T-003 Auth+JWT │       │ T-004 Errors+rate │      │ T-021 Expo init │
└────────┬───────┘       └─────────┬─────────┘      └────────┬────────┘
         │                         │                         │
         └────────┬────────────────┘                         │
                  │                                          │
                  ▼                                          ▼
         ┌────────────────┐                    ┌──────────────────────┐
         │ T-005 /me API  │                    │ T-022 Design tokens  │
         └────────┬───────┘                    └──────────┬───────────┘
                  │                                       │
                  ▼                                       ▼
         ┌────────────────────┐               ┌────────────────────────┐
         │ T-006 Days+Entries │               │ T-023 Quad component   │
         └────────┬───────────┘               └──────────┬─────────────┘
                  │                                      │
        ┌─────────┼──────────┐                ┌──────────▼─────────────┐
        ▼         ▼          ▼                │ T-024 Pillar glyphs    │
   ┌───────┐ ┌──────┐ ┌─────────────┐         └──────────┬─────────────┘
   │T-007  │ │T-008 │ │ T-009       │                    │
   │AI tag │ │Voice │ │ Streaks     │                    ▼
   └───┬───┘ └───┬──┘ └──────┬──────┘         ┌──────────────────────┐
       │        │            │                │ T-025 Navigation     │
       │        │            │                └──────────┬───────────┘
       └────────┼────────────┘                           │
                │                                        ▼
                ▼                              ┌──────────────────────┐
       ┌─────────────────┐                     │ T-026 Auth flow (UI) │
       │ T-010 Cron jobs │                     └──────────┬───────────┘
       └─────────────────┘                                │
                                                          ▼
                                              ┌────────────────────────┐
                                              │ T-027..T-038 screens   │
                                              └────────────────────────┘
```

---

## Full ticket index

### Backend (T-001 → T-014)

| # | Ticket | Depends | Est. |
|---|---|---|---|
| T-001 | [Replit project setup](./backend/T-001-replit-setup.md) | — | 30 |
| T-002 | [Postgres schema + migrations](./backend/T-002-postgres-schema.md) | T-001 | 60 |
| T-003 | [Apple + Google Sign-In + JWT middleware](./backend/T-003-auth-jwt.md) | T-002 | 90 |
| T-004 | [Error envelope, rate limits, health](./backend/T-004-errors-ratelimit-health.md) | T-001 | 60 |
| T-005 | [User endpoints (/me CRUD)](./backend/T-005-user-endpoints.md) | T-003, T-004 | 60 |
| T-006 | [Days + Entries API](./backend/T-006-days-entries-api.md) | T-005 | 90 |
| T-007 | [AI tagging endpoint (Claude Haiku 4.5)](./backend/T-007-ai-tag.md) | T-006 | 60 |
| T-008 | [Voice transcription endpoint (Whisper)](./backend/T-008-voice-transcribe.md) | T-006 | 60 |
| T-009 | [Streaks engine + endpoints](./backend/T-009-streaks-engine.md) | T-006 | 60 |
| T-010 | [Cron jobs (daily, weekly, monthly)](./backend/T-010-cron-jobs.md) | T-009 | 90 |
| T-011 | [Insights engine + endpoint](./backend/T-011-insights-engine.md) | T-006, T-009 | 90 |
| T-012 | [Subscription / IAP receipt verification](./backend/T-012-subscription-iap.md) | T-005 | 60 |
| T-013 | [Push notifications (Expo Push API)](./backend/T-013-push-notifications.md) | T-005 | 60 |
| T-014 | [Account deletion (GDPR/DSR)](./backend/T-014-account-deletion.md) | T-005 | 30 |

### Mobile (T-021 → T-038)

| # | Ticket | Depends | Est. |
|---|---|---|---|
| T-021 | [Expo project setup + repo structure](./mobile/T-021-expo-setup.md) | — | 30 |
| T-022 | [Design tokens (palette, type, motion)](./mobile/T-022-design-tokens.md) | T-021 | 60 |
| T-023 | [The Quad component](./mobile/T-023-quad-component.md) | T-022 | 90 |
| T-024 | [Four pillar glyph SVGs](./mobile/T-024-pillar-glyphs.md) | T-022 | 60 |
| T-025 | [Navigation skeleton](./mobile/T-025-navigation.md) | T-022 | 30 |
| T-026 | [Auth flow UI (Apple + Google)](./mobile/T-026-auth-flow.md) | T-025, T-003 | 60 |
| T-027 | [Onboarding: welcome + pillars + tradition](./mobile/T-027-onboarding-1.md) | T-026 | 60 |
| T-028 | [Onboarding: identity + cue + notifications](./mobile/T-028-onboarding-2.md) | T-027 | 60 |
| T-029 | [Onboarding: Day-0 ritual + first close](./mobile/T-029-day-zero.md) | T-028, T-023, T-024 | 90 |
| T-030 | [Home screen](./mobile/T-030-home.md) | T-023, T-024, T-006 | 90 |
| T-031 | [Pillar capture: Mental + Physical](./mobile/T-031-pillar-capture-mental-physical.md) | T-030 | 60 |
| T-032 | [Pillar capture: Spiritual (5 traditions)](./mobile/T-032-pillar-capture-spiritual.md) | T-031 | 60 |
| T-033 | [Pillar capture: Financial (3-button)](./mobile/T-033-pillar-capture-financial.md) | T-031 | 30 |
| T-034 | [Voice capture overlay](./mobile/T-034-voice-overlay.md) | T-031, T-008 | 90 |
| T-035 | [Day complete animation](./mobile/T-035-day-complete.md) | T-030 | 60 |
| T-036 | [History + day-detail screens](./mobile/T-036-history.md) | T-030, T-006 | 60 |
| T-037 | [Weekly close screen](./mobile/T-037-weekly-close.md) | T-030 | 60 |
| T-038 | [Settings screen](./mobile/T-038-settings.md) | T-030, T-005 | 60 |

### Cross-cutting + paywall (T-041 → T-046)

| # | Ticket | Depends | Est. |
|---|---|---|---|
| T-041 | [Day-30 paywall screen](./mobile/T-041-day-30-paywall.md) | T-030, T-011, T-012 | 90 |
| T-042 | [Subscription manage screen](./mobile/T-042-subscription-manage.md) | T-041 | 30 |
| T-043 | [Home-screen widget (Quad)](./mobile/T-043-home-widget.md) | T-023 | 90 |
| T-044 | [HealthKit + Health Connect read](./mobile/T-044-health-integrations.md) | T-031 | 90 |
| T-045 | [i18n scaffolding (en + ar + es)](./mobile/T-045-i18n.md) | T-022 | 60 |
| T-046 | [Accessibility audit + fixes](./mobile/T-046-a11y.md) | all screens | 60 |

### Ops (T-051 → T-055)

| # | Ticket | Depends | Est. |
|---|---|---|---|
| T-051 | [App Store Connect setup](./ops/T-051-app-store-connect.md) | T-021 | 60 |
| T-052 | [Google Play Console setup](./ops/T-052-play-console.md) | T-021 | 60 |
| T-053 | [TestFlight + internal-testing flow](./ops/T-053-testflight.md) | T-051 | 30 |
| T-054 | [Error monitoring (Sentry)](./ops/T-054-error-monitoring.md) | T-021, T-001 | 30 |
| T-055 | [Telemetry — audit_events instrumentation](./ops/T-055-telemetry.md) | T-006 | 60 |

**Total: 38 tickets.** ~36 hours of agent work if everything went linearly. With parallelism (you can run T-001/T-002/T-021 simultaneously, etc.) closer to ~3 calendar weeks of focused build for one operator.

---

## Building order (recommended)

**Sprint 1 — backend foundation:** T-001 → T-002 → T-003 + T-004 (parallel) → T-005

**Sprint 2 — backend domain + mobile foundation:** T-006 + T-021 (parallel) → T-007 + T-008 + T-009 + T-022 (parallel) → T-010

**Sprint 3 — mobile primitives:** T-023 + T-024 + T-025 (parallel) → T-026

**Sprint 4 — onboarding:** T-027 → T-028 → T-029

**Sprint 5 — daily app:** T-030 → T-031 + T-032 + T-033 (parallel) → T-034 → T-035

**Sprint 6 — secondary surfaces:** T-036 + T-037 + T-038 (parallel) → T-043 → T-044

**Sprint 7 — paywall + cross-cutting:** T-011 → T-012 → T-013 → T-041 → T-042 → T-014

**Sprint 8 — ops + polish:** T-045 → T-046 → T-054 → T-055 → T-051 + T-052 (parallel) → T-053

---

## What gets carried into Phase 6 (Replit prompts)

Each ticket here becomes a wrapped Replit Agent prompt at `docs/prompts/T-NNN.md`. The wrapper adds:

- The brand bible's rejection list (§9) inline
- The relevant PRD sections inline
- A standard preamble explaining the project
- A standard postamble: "before completing, verify against acceptance criteria + rejection list"

So tickets here can stay short. The prompts directory does the prompt-engineering lift.
