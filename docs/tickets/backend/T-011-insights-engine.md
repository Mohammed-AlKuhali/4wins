# T-011 — Insights engine + endpoint

**Area:** backend
**Estimate:** 90 min
**Depends on:** T-006, T-009
**Implements PRD:** §3 Flow E (day-30 paywall), §6 (GET /v1/insights)
**Brand bible:** §3 (no chatbot, no AI Coach — invisible analysis)

## Goal

Generate the cross-pillar correlation insights that gate the day-30 paywall (the entire conversion mechanic). Three insight cards: completion stats, day-of-week pattern, and the paywalled cross-pillar correlation.

## What to build

1. `generate_day_30_insights(userId)` — replaces T-010 stub. Computes three insight rows from the user's `days` and `entries` and inserts them into `insights`.
2. `GET /v1/insights?since=ISO_DATE` — returns the user's insights. For paywalled rows, omits the payload contents but returns metadata + `is_paywalled: true`.
3. The three v1 insight types:
   - `pillar_consistency`: "You closed N of 30 days. Top pillar: <X>." (free)
   - `time_of_day_pattern`: "Your <X> wins cluster on <day_of_week>." (free)
   - `cross_pillar_correlation`: "Days you logged <pillar A> were <ratio>× more likely to be full-Quad days." (paywalled)
4. Statistical sanity: avoid spurious correlations. Only emit `cross_pillar_correlation` if N ≥ 30 and effect size ≥ 1.5×.
5. The endpoint also serves the swipeable-cards format used by the day-30 paywall screen (T-041): three cards in display order.

## Files to create / modify

```
src/domain/insights/
  generate.ts                         # main entry, orchestrates the 3 types
  pillar_consistency.ts
  time_of_day_pattern.ts
  cross_pillar_correlation.ts
  format_card.ts                      # converts payload → card display strings

src/routes/insights.ts                # GET /v1/insights

src/app.ts

tests/insights.test.ts
tests/fixtures/seed_30_days.ts        # helper to seed a fake user with 30 days of data
```

## Insight payload shapes (stored in `insights.payload`)

### `pillar_consistency`
```ts
{
  days_complete: number;
  days_total: number;
  top_pillar: 'mental'|'physical'|'spiritual'|'financial';
  top_pillar_count: number;
}
```
Display string: `"You closed {days_complete} of {days_total} days. Top pillar: {top_pillar}."`

### `time_of_day_pattern`
```ts
{
  pillar: 'mental'|'physical'|'spiritual'|'financial';
  cluster_day_of_week: 0|1|2|3|4|5|6;   // 0=Sun
  cluster_pct: number;                   // 0..1
}
```
Display: `"Your {pillar} wins cluster on {weekday name}."`

### `cross_pillar_correlation`
```ts
{
  pillar: 'mental'|'physical'|'spiritual'|'financial';
  full_quad_lift: number;                // ratio, e.g. 2.3
  n: number;                             // sample size
}
```
Display: `"Cross-pillar: days you logged {pillar} were {full_quad_lift.toFixed(1)}× more likely to be full-Quad days."`

## Acceptance criteria

- [ ] `generate_day_30_insights(userId)` is idempotent — calling twice doesn't create duplicate rows. Use a `(user_id, type)` uniqueness check.
- [ ] All three insight types generate when user has 30+ closed days.
- [ ] `pillar_consistency` and `time_of_day_pattern` are stored with `is_paywalled=false`. `cross_pillar_correlation` with `is_paywalled=true`.
- [ ] `cross_pillar_correlation` is suppressed when sample size < 30 or effect size < 1.5×.
- [ ] `GET /v1/insights` requires auth, returns insights in chronological order (newest first).
- [ ] Paywalled rows return: `{ id, generated_at, type, is_paywalled: true, preview: "Cross-pillar correlation. Trial to unlock." }` — no payload.
- [ ] Free-tier users (`subscription_status='free'`) never see paywalled payloads. Trial/paid users see all payloads.
- [ ] Tests: with seeded 30-day data, all three insights generate. With 25-day data, only consistency + time-of-day. With high-variance data, correlation is suppressed.
- [ ] Audit event: `insights_generated` with metadata `{ types: ['pillar_consistency', ...] }` (no values).

## Non-goals

- No additional insight types in v1 (week-to-week comparisons, trend lines, "your worst week" comparisons all banned per brand).
- No insight deletion/regeneration UI.
- No on-demand regeneration (it's a one-time event at day 30; future regeneration is a v1.5 ticket if needed).

## Notes for the agent

- Compute all stats in SQL (one or two queries) — don't pull all entries into Node. Postgres `GROUP BY EXTRACT(DOW FROM date)` handles the day-of-week clustering.
- For `cross_pillar_correlation`: for each pillar P, compute `P(full_quad | P logged) / P(full_quad | P NOT logged)`. Pick the pillar with the highest ratio ≥ 1.5×. If multiple tie, prefer the user's `top_pillar`.
- "Full-Quad day" = `closed_at IS NOT NULL`.
- Sample size N: number of days in the user's history (cap at 90 days for the v1 computation).
- Don't generate insights for days with `is_rest_day=true` — they bias the data.
- The display strings in §payload go through i18n in the mobile client (T-045) — server returns the structured payload, not pre-formatted text. Exception: paywalled `preview` text is server-side English in v1; T-045 will localize.
- Confidence: this is statistical, not causal. Be careful in the brand bible's voice — say "correlate," not "cause."
