# T-002 — Postgres schema + migrations

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-001
**Implements PRD:** §5 (data model)
**Brand bible:** none directly

## Goal

Define the full Postgres schema for v1 in Drizzle, generate the initial migration, and wire `src/lib/db.ts` to the running database. After this ticket, every later backend ticket can `import { db } from '@/lib/db'` and write type-safe queries.

## Context

The schema is fully specced in PRD §5. Tables: `users`, `days`, `entries`, `streaks`, `weekly_summaries`, `insights`, `push_tokens`, `audit_events`. UUID PKs, `timestamptz` everywhere, soft-delete on users.

## What to build

1. Drizzle schema files, one per table, in `src/db/schema/`.
2. A single barrel `src/db/schema/index.ts` re-exporting all tables.
3. `drizzle.config.ts` at repo root.
4. The first migration generated via `drizzle-kit generate`, committed under `src/db/migrations/`.
5. `src/lib/db.ts` exports `db` (Drizzle client) bound to `env.DATABASE_URL`, plus `sql` raw client for cron jobs.
6. A `npm run db:migrate` script that runs pending migrations.
7. A `npm run db:reset` script (dev only) that drops + re-applies — guarded so it errors in non-dev.
8. A vitest test that connects, inserts a user, queries it back, and rolls back.

## Files to create / modify

```
drizzle.config.ts
src/db/schema/
  index.ts
  users.ts
  days.ts
  entries.ts
  streaks.ts
  weekly_summaries.ts
  insights.ts
  push_tokens.ts
  audit_events.ts
src/db/migrations/
  0000_init.sql           # generated
src/lib/db.ts             # populated
package.json              # add scripts: db:generate, db:migrate, db:reset
tests/db.test.ts          # connection + roundtrip test
```

## Acceptance criteria

- [ ] All 8 tables exist as Drizzle schema files matching PRD §5.
- [ ] Constraints from PRD are enforced: `users.email UNIQUE`, `users.tradition` CHECK, `days UNIQUE(user_id, date)`, FK `ON DELETE CASCADE` on user-owned tables, `entries.input_method` CHECK, etc.
- [ ] Indexes from PRD exist: `days(user_id, date DESC)`, `entries(user_id, captured_at DESC)`, `entries(day_id)`, `insights(user_id, generated_at DESC)`, `push_tokens(token UNIQUE)`, `audit_events(user_id, created_at DESC)`.
- [ ] `npm run db:migrate` applies cleanly to a fresh Postgres.
- [ ] `npm test` passes the roundtrip test.
- [ ] `db.test.ts` proves: insert user, insert day for that user, insert entry on that day, query the day with its entries, delete user → cascade clears days + entries.
- [ ] `pillars_logged` is a `text[]` column with a CHECK that elements are in the four pillar names.

## Non-goals

- No seed data (later in dev tooling).
- No business logic (creating-day-on-first-entry is in T-006).
- No views, no triggers, no stored procedures.

## Notes for the agent

- Use `pgEnum` for the enums (`tradition`, `pillar`, `input_method`, `subscription_status`, `insight_type`, `cue_time_of_day`, `platform`).
- For `iso_week`, use `text` not a custom type — it's `'2026-W18'` format, simple string.
- For `pillars_logged`, use `text("pillars_logged").array().notNull().default(sql\`'{}'::text[]\`)` then add a CHECK via raw SQL in the migration.
- For `cue_time_local`, use Drizzle's `time` type.
- For `notification_prefs`, use `jsonb()` with a default object.
- Do NOT use `bigserial` PKs. UUID v7 generated app-side or `uuid_generate_v4()` server-side. Prefer app-side generation via `crypto.randomUUID()` in TS.
- `email` is `text`, not `varchar(N)`. We don't enforce length at DB level.
- The `streaks.month_year` field is `'YYYY-MM'` text, used by the monthly-refresh cron.
- All `timestamptz` columns default to `now()` where the PRD says so.
