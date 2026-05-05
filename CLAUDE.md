# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

4Wins is a mobile app for a daily four-pillar discipline ritual (Physical, Mental, Spiritual, Financial). The repo has two layers:

1. **Spec layer (`docs/`)** — concept, research, brand bible, PRD, 38 tickets. **This is binding source-of-truth for the implementation, not aspirational documentation.** When code and spec disagree, the spec wins; update the code.
2. **Implementation layer** — backend at repo root + `src/`, mobile at `apps/mobile/`. Built initially by Replit Agent against the spec.

A third file orchestrates autonomous builds: `.replit-agent-context.md`. It is the standing instruction for Replit Agent's autonomous mode (read tickets in dependency order, implement, self-verify, commit). It is NOT for Claude Code's use, but it documents the build conventions Claude should respect.

## Source-of-truth hierarchy

When making decisions, consult in this order:

1. `docs/03-brand.md §9` — the rejection list. Banned colors, fonts, copy patterns, interactions. Applies to **all** code (backend errors, READMEs, comments — not just UI).
2. `docs/04-prd.md §9` — explicit "out of scope for v1" list. Anything banned here (Plaid, social feed, leaderboards, badges, etc.) must not appear.
3. `docs/04-prd.md §5` (data model) and `§6` (API surface) — the schema and endpoint shapes are locked.
4. The specific ticket file under `docs/tickets/` for whatever feature is being touched.

## Locked stack — never substitute silently

**Backend** (repo root):
- Node 22, ESM (`"type": "module"`)
- Hono v4+ — NOT Express, NOT Fastify
- Postgres + Drizzle ORM with `postgres-js` driver — NOT Prisma, NOT `pg`, NOT Sequelize
- zod, vitest, jose (JWT), pino, dotenv

**Mobile** (`apps/mobile/`):
- Expo SDK 53+, expo-router v4 (file-based)
- react-native-svg, react-native-reanimated 3, @tanstack/react-query
- expo-apple-authentication + expo-auth-session for auth
- NO nativewind, tamagui, gluestack, or any UI kit
- NO Lucide, Heroicons, or external icon packs — pillar glyphs are proprietary (`apps/mobile/components/PillarGlyph/`)

## Common commands

### Backend (run from repo root)

```bash
npm run dev              # tsx watch on port 8080 (set in .replit; PRD spec said 8787 — Replit override)
npm test                 # vitest run (run all)
npx vitest run path      # run a single test file
npm run db:generate      # drizzle-kit generate from schema changes
npm run db:migrate       # apply migrations
npm run db:reset         # dev-only, drops + reapplies
npm run cron:tick        # invoke cron runner once locally
npm run build            # tsc → dist/
```

### Mobile (run from `apps/mobile/`)

```bash
npx expo start           # start Metro bundler (needs network; sandboxed envs may fail)
npm test                 # jest with jest-expo preset
npx tsc --noEmit         # type-check (CI does this)
npm run lint
npm run release:beta     # eas build for both iOS + Android preview profiles
```

CI (`.github/workflows/ci.yml`) runs backend tests against a live Postgres service and type-checks mobile. There's also an integration test mode triggered with `INTEGRATION=1` for `src/__tests__/audit.test.ts` against a live local server.

## Architecture (the parts that span files)

### Backend

- `src/index.ts` boots Hono. Env loaded via `src/lib/env.ts` (zod-validated; never read `process.env` directly elsewhere).
- `src/app.ts` composes routes + middleware. Middleware order matters: `request_log` → `error_handler` → route-specific `rate_limit` → `require_auth` (auth-only routes).
- **Routes are thin.** They parse, validate (zod), call into `src/domain/<area>/`, return shaped responses. Business logic lives in `domain/`, never in routes.
- **Day/entry flow** (`src/domain/days/`, `src/domain/entries/`): `POST /v1/entries` lazily creates today's `day` row, recomputes `pillars_logged` array from all entries on that day (don't append — re-aggregate), sets `closed_at` on the transition to 4 pillars, then calls `recomputeStreak`. Idempotency-Key header dedupes within 60s.
- **Streaks** (`src/domain/streaks/recompute.ts`): the **Day 2 rule** — the first complete day doesn't count toward the current streak; streak = consecutive complete days strictly after that. Missed days become `is_rest_day=true` if a freeze is available, else streak resets silently (no notification, no UI shame).
- **AI tagging** (`src/domain/ai/tag_pillar.ts`): Claude Haiku 4.5 with a disk-loaded system prompt (`prompts/tag_pillar.system.md`). LRU cache 1000 entries / 5 min. Heuristic fallback when API fails — never error the entry-create flow.
- **Cron** (`src/cron/runner.ts`): single endpoint `POST /v1/internal/cron` (gated by `X-Cron-Secret`) hit every 5 min by Replit's scheduler. Runner enumerates users, dispatches jobs, idempotent via `jobs_run_log (job_name, user_id, run_for_date)` UNIQUE constraint. Per-user time decisions use `Intl.DateTimeFormat` with `users.timezone` — no `date-fns-tz`.
- **Audit telemetry** (`src/routes/audit.ts`): server-enforced **allowlist** of metadata keys. Any banned key (`raw_text`, `email`, `identity_*`, etc.) returns 422. This is a privacy guarantee, not a guideline.

### Mobile

- File-based routing (`apps/mobile/app/`) with three groups: `(onboarding)`, `(app)`, `(modals)`. Auth gate in `app/_layout.tsx` redirects based on token presence in `expo-secure-store`.
- **No bottom tab bar anywhere** (brand bible §8). Settings reachable from a single icon top-right of home.
- **Design tokens** (`apps/mobile/theme/`) are the only source of color/type/motion. Don't write hex values inline. Banned tokens (Inter/Geist/Satoshi/indigo/violet/fuchsia) are blocked by a unit test.
- **The Quad** (`components/Quad/Quad.tsx`) is the central visual primitive: four 90° arcs of one circle (Mental top, Financial right, Spiritual bottom, Physical left). Owns the close-the-day animation (~2.4s, single haptic at 800ms, NO bounce, NO confetti).
- **Pillar capture** (`app/(app)/pillar/[pillar].tsx`) routes to per-pillar variant components. Mental + Physical share the generic `PillarCaptureShell`; Spiritual routes by `users.tradition`; Financial is a 3-button form (yes / not_quite / not_today), NOT voice-first.
- **Voice overlay** (`app/(modals)/voice.tsx`) records via expo-av, uploads to backend `/v1/voice/transcribe` (server-side Whisper), shows the transcript with a save/re-record review state.

### Shared conventions

- **UUIDs everywhere** (`crypto.randomUUID()` app-side), except `rate_limits` and `jobs_run_log` which use `bigserial`.
- **All timestamps `timestamptz`**, defaulted to `now()`.
- **Soft-delete on users**: `deleted_at` set, PII scrubbed, sessions revoked. Hard delete via cron after 30 days. Re-sign-in within 30 days should restore (currently broken — see "Known issues").
- **No third-party analytics** on entry content. Sentry events are PII-scrubbed (`email`, `identity_statement`, `raw_text`, `custom_tradition_text` stripped).

## Known issues to fix before launch

These were flagged by audit but Replit Agent has not yet fixed them. If you (Claude) are asked to work on subscription, account deletion, widgets, or Health, address these first:

1. **`src/domain/subscription/redeem_apple.ts`** — IAP receipt verification is stubbed. Decodes the JWT segment locally and trusts client-supplied `expiresDateMs`. Must call App Store Server API V2 using the existing `buildAppleJWT` helper. **Security issue** — anyone can craft a fake receipt. Same for `redeem_google.ts` (Google Play Developer API).
2. **`src/domain/auth/upsert_user.ts`** — never calls `restoreSoftDeletedUser` from `src/domain/users/restore.ts`. Soft-deleted users re-signing in within 30 days hit the NOT NULL email constraint and fail. Wire the restore.
3. **`apps/mobile/modules/widget-{ios,android}/`** — JS shims call `NativeModules.WidgetSync` that doesn't exist. Either author the Swift WidgetKit + Kotlin Glance code, or remove the shims and document widgets as v1.5.
4. **`apps/mobile/lib/health/{ios,android}.ts`** — same pattern, no native modules. Either author them or strip the dead JS.
5. **`src/middleware/rate_limit.ts`** — DB sync is fire-and-forget (`setImmediate` with swallowed errors), never read on hit-check. Single-instance only despite the spec calling for cross-instance correctness.
6. **`src/routes/insights.ts:31`** — returns user-facing string `"Trial to unlock."` — "unlock" is on brand bible §9 rejection list. Replace.
7. **`tests/rate_limit.test.ts`** — smoke test (`typeof === 'function'`). Replace with a real burst test.

## Replit-specific notes

- `.replit` configures Node 20 module + port 8080. Spec said Node 22 + 8787; Replit's autoscale defaults to 8080. Don't "fix" 8080 → 8787 unless the deployment config is also updated.
- Cron is wired via Replit Scheduler hitting `POST /v1/internal/cron` every 5 min. Set `CRON_SECRET` in Replit Secrets.
- Replit Postgres provides `DATABASE_URL`. Reserved Deployments tier is the assumption.
- Outbound network: Replit can reach Anthropic, OpenAI, Apple, Google. If running locally in a sandbox without outbound, the AI tagger's heuristic fallback kicks in.

## Branch convention

`main` is the default. Feature work branches as `claude/4wins-<feature>-<id>`. Don't push to `main` without confirmation; merge from feature branches once acceptance criteria pass.

## When you're stuck

| Question | File |
|---|---|
| What does this brand sound like? | `docs/03-brand.md §3` (voice + sample copy) |
| Is X feature in v1? | `docs/04-prd.md §0` (scope) and `§9` (out of scope) |
| What's a screen supposed to look like? | `docs/04-prd.md §3`, `§4` |
| What's the data model? | `docs/04-prd.md §5` |
| What's the rationale for a decision? | `docs/02-research.md` and `docs/research/` |
| Build order / dependencies | `docs/tickets/README.md` |
