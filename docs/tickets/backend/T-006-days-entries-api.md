# T-006 — Days + Entries API (the daily ritual)

**Area:** backend
**Estimate:** 90 min
**Depends on:** T-005
**Implements PRD:** §6 (Days + entries endpoints), §2 Flow B (daily ritual), §5 (data model)
**Brand bible:** §2 (Quad states)

## Goal

The single most important backend ticket. Implements the four endpoints that power the daily ritual — `GET /v1/today`, `POST /v1/entries`, `PATCH /v1/entries/:id`, `DELETE /v1/entries/:id` — plus the day-creation/closure logic that drives the Quad's state.

## What to build

1. `GET /v1/today` — returns today's `day` row, all of today's `entries`, and a streak summary in one response. Creates today's day row lazily if absent.
2. `POST /v1/entries` — creates an entry. If `pillar` omitted, calls T-007's AI tagger. Server: creates day if missing, appends pillar to `day.pillars_logged`, sets `day.closed_at = now()` if all 4 pillars present. Returns the new entry + updated day state + streak update if applicable.
3. `PATCH /v1/entries/:id` — edit `raw_text` or correct `pillar` (e.g., user accepts AI's "this was Spiritual not Mental" suggestion). Updating `pillar` triggers day-state recalc.
4. `DELETE /v1/entries/:id` — remove entry. Recalculates `day.pillars_logged` and `closed_at`. Updates streak if today's day un-closes.
5. **Streak update integration** — after every write, run streak engine (T-009 will own the engine; this ticket calls a stub `recomputeStreak(userId)` that T-009 fills in).
6. **Audit events** for `entry_created`, `entry_updated`, `entry_deleted`, `day_closed`.
7. **Idempotency** — `POST /v1/entries` accepts an optional `Idempotency-Key` header; same key + same user within 60s returns the original response.

## Files to create / modify

```
src/routes/today.ts                 # GET /v1/today
src/routes/entries.ts               # POST/PATCH/DELETE /v1/entries

src/domain/days/
  ensure_today.ts                   # idempotent get-or-create today's day
  recompute_day_state.ts            # given entries, set pillars_logged + closed_at
  date_utils.ts                     # user-tz date math

src/domain/entries/
  create.ts                         # main creation flow incl. AI tag fallback
  update.ts
  delete.ts
  validate.ts                       # zod schemas

src/domain/streaks/
  recompute.ts                      # STUB — interface only, T-009 implements

src/lib/idempotency.ts              # in-memory + DB-backed key cache (60s TTL)

src/app.ts                          # register routes

tests/today.test.ts
tests/entries.test.ts
tests/idempotency.test.ts
```

## API shapes

### `GET /v1/today` response

```ts
{
  day: {
    id: string;
    date: string;                     // 'YYYY-MM-DD' in user tz
    pillars_logged: ('mental'|'physical'|'spiritual'|'financial')[];
    closed_at: string | null;
    is_rest_day: false;               // never true for today
  };
  entries: Entry[];                   // today's entries, captured_at desc
  streak: {
    current: number;
    longest: number;
    freezes_remaining: number;
  };
}
```

### `POST /v1/entries` body

```ts
{
  pillar?: 'mental'|'physical'|'spiritual'|'financial';   // omit to AI-tag
  input_method: 'voice'|'type'|'lazy_path'|'healthkit_auto'|'health_connect_auto';
  raw_text?: string;                                       // required unless lazy_path or *_auto
  structured_data?: Record<string, unknown>;               // pillar-specific (see below)
  duration_seconds?: number;
}
```

`structured_data` examples:
- Mental: not used in v1.
- Financial: `{ behavior_match: 'yes' | 'not_quite' | 'not_today' }`. Required for Financial.
- Physical: `{ source: 'healthkit' | 'health_connect' | 'manual', kind?: 'walk'|'run'|'workout', duration_min?: number }`.
- Spiritual: not used in v1.

### `POST /v1/entries` response

```ts
{
  entry: Entry;
  day: { id, date, pillars_logged, closed_at };
  streak?: { current, longest, freezes_remaining };       // present iff streak changed
  ai_tag?: { suggested_pillar, confidence, reasoning };   // present iff pillar was inferred
  pillar_mismatch_hint?: { current: string, suggested: string };  // if AI thinks user logged in wrong bucket
}
```

## Acceptance criteria

- [ ] `GET /v1/today` creates today's day row lazily and returns it. Two concurrent calls do NOT create two rows (use `ON CONFLICT (user_id, date) DO NOTHING`).
- [ ] `POST /v1/entries` with `pillar` omitted calls AI tag stub (returns `{ pillar: 'mental', confidence: 0.5 }` until T-007 lands).
- [ ] Posting an entry with a `pillar` already in `pillars_logged` for today is allowed — multiple entries per pillar are valid (a user can log 3 Spiritual reflections in one day).
- [ ] When the 4th distinct pillar is logged, `day.closed_at` is set and `recomputeStreak()` is called.
- [ ] Editing an entry's `pillar` recomputes `day.pillars_logged` from scratch (re-aggregate all entries on that day).
- [ ] Deleting an entry recomputes day state. If it un-closes the day, `closed_at` is cleared and streak recomputes.
- [ ] Validation: `lazy_path` → `raw_text` and `structured_data` ignored. `voice`/`type` → `raw_text` required. `healthkit_auto`/`health_connect_auto` → must be Physical, `structured_data.source` matches.
- [ ] Financial entries must include `structured_data.behavior_match` ∈ {yes, not_quite, not_today}.
- [ ] Idempotency key returns identical response on retry within 60s.
- [ ] Tests: GET today (empty + with entries), POST with explicit pillar, POST without pillar (uses stub), POST 4th pillar closes day, DELETE un-closes, PATCH pillar re-aggregates, idempotency, validation failures.
- [ ] Audit events: `entry_created` (always), `day_closed` (when 4th pillar lands), `entry_updated`, `entry_deleted` — ALL with no entry text in metadata.

## Non-goals

- No real AI tagging (T-007).
- No real voice (T-008).
- No real streak math (T-009 owns; this ticket calls stub).
- No HealthKit-specific server logic — it's just an `input_method` enum value.
- No history endpoint (separate ticket implied; covered by T-009 streak summary + future `/v1/history`).

## Notes for the agent

- "Today" is computed in `users.timezone`, not server tz. `date_utils.ts`: given a `Date` and an IANA tz, return `YYYY-MM-DD` of that calendar day. Use `Intl.DateTimeFormat` (`{ timeZone, year, month, day }`) — DO NOT use date-fns-tz unless you also pin a small dep set.
- `pillars_logged` is a sorted unique array — re-aggregate on every change to prevent drift.
- `closed_at` is set only on the *transition* — not re-set if pillars_logged already had 4. This matters for streak idempotency.
- The AI tagger stub: `async function tagPillar(text: string): Promise<{ pillar, confidence, reasoning }>` — returns `{ pillar: 'mental', confidence: 0, reasoning: 'stub' }`. T-007 swaps the implementation.
- The streak stub: `async function recomputeStreak(userId: string): Promise<StreakRow>` — returns the existing `streaks` row unchanged. T-009 swaps in the real recompute.
- `pillar_mismatch_hint`: only included when client sent an explicit `pillar` AND AI tagger suggested a different one with confidence ≥0.7. Client decides whether to surface the soft prompt (PRD Flow B step 5a).
- Idempotency cache: same in-memory + DB hybrid as rate_limit (T-004). Use a `idempotency_keys (key, user_id, response_json, expires_at)` table.
