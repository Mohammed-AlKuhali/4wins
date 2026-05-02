# T-001 — Replit project setup

**Area:** backend
**Estimate:** 30 min
**Depends on:** none
**Implements PRD:** §6 (API surface), §8 (NFRs)
**Brand bible:** none directly

## Goal

Stand up the Replit project that will host the 4Wins backend. Establish a clean repo structure that the next ~14 backend tickets will build into.

## Context

This is a TypeScript Node.js backend. We're using Hono as the web framework (small, fast, native fetch types — fits Replit Reserved Deployments well). Postgres is the datastore (Replit Postgres, included in their Reserved tier). Drizzle ORM for type-safe queries. Vitest for tests.

## What to build

1. A Replit Reserved Deployment configured for Node 22, served on port 8787.
2. `package.json` with Hono, Drizzle, postgres-js, zod, vitest, tsx, dotenv.
3. TypeScript config (`tsconfig.json`) — strict, ESNext, NodeNext modules.
4. Repo skeleton (see file list).
5. A minimal `GET /v1/health` returning `{ status: "ok" }` so we can verify the server runs.
6. `.env.example` with the env vars all later tickets will need:
   ```
   DATABASE_URL=
   JWT_SECRET=
   APPLE_TEAM_ID=
   APPLE_KEY_ID=
   APPLE_PRIVATE_KEY=
   GOOGLE_CLIENT_ID_IOS=
   GOOGLE_CLIENT_ID_ANDROID=
   OPENAI_API_KEY=
   ANTHROPIC_API_KEY=
   EXPO_ACCESS_TOKEN=
   APP_STORE_SHARED_SECRET=
   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
   PORT=8787
   ```
7. A `README.md` at repo root explaining how to run, test, and deploy.

## Files to create

```
package.json
tsconfig.json
.gitignore
.env.example
README.md
src/
  index.ts                # entrypoint, starts Hono server
  app.ts                  # Hono app composition (route registration)
  routes/
    health.ts             # GET /v1/health
  lib/
    db.ts                 # placeholder, populated in T-002
    env.ts                # zod-validated env loader
  middleware/
    .gitkeep
  domain/
    .gitkeep
  cron/
    .gitkeep
tests/
  health.test.ts          # vitest test that GET /v1/health returns ok
```

## Acceptance criteria

- [ ] `npm install` succeeds with no peer-dep warnings.
- [ ] `npm run dev` starts the server on port 8787 without errors.
- [ ] `curl http://localhost:8787/v1/health` returns `{"status":"ok"}` with HTTP 200.
- [ ] `npm test` runs the health test and it passes.
- [ ] `npm run build` produces `dist/` with no errors. `npm start` runs the built artifact.
- [ ] `src/lib/env.ts` zod-validates env at boot — missing required vars throw a clear error before the server starts.
- [ ] `.env.example` exists and contains every env var listed above (values blank).
- [ ] README documents: install, dev, test, build, deploy, env setup.

## Non-goals

- No DB schema yet (that's T-002).
- No auth (T-003).
- No business logic.
- No CI / GitHub Actions (T-054 covers monitoring; CI is implicit via Replit deploy).

## Notes for the agent

- Use Hono v4+. Don't use Express.
- Use `postgres-js` (the `postgres` npm package) as the driver, paired with Drizzle. Don't use `pg` or Prisma.
- `src/lib/env.ts` should export a typed `env` object. Every later ticket imports from there — never `process.env` directly.
- The health endpoint must NOT require auth (rate-limit middleware in T-004 will allow it).
- Use ESM (`"type": "module"` in package.json). All imports use `.js` extensions in source.
- Do NOT install Express, Prisma, pg, or Sequelize even if the user asks — those are not the chosen stack and adding them creates churn for later tickets.
