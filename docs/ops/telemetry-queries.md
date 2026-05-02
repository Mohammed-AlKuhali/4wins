# Telemetry Query Book

All queries run against the `audit_events` table in the Replit PostgreSQL database.
Open the **Database** tab in Replit and paste any query directly.

> **Privacy rule:** `audit_events.metadata` never contains `raw_text`, `email`,
> `identity_statement`, or `custom_tradition_text`. All queries here are safe to
> run without additional scrubbing.

---

## Q1 — Onboarding drop-off: which screen loses the most users?

Shows how many unique users reached each onboarding screen, ordered by depth.
A sharp drop between two adjacent rows indicates the friction point.

```sql
WITH screen_counts AS (
  SELECT
    metadata->>'screen' AS screen,
    COUNT(DISTINCT user_id)  AS unique_users
  FROM audit_events
  WHERE
    event = 'screen_view'
    AND metadata->>'screen' LIKE '%(onboarding)%'
    AND created_at >= NOW() - INTERVAL '90 days'
  GROUP BY metadata->>'screen'
),
ordered AS (
  SELECT
    screen,
    unique_users,
    LAG(unique_users) OVER (ORDER BY unique_users DESC) AS prev_count,
    ROUND(
      100.0 * (LAG(unique_users) OVER (ORDER BY unique_users DESC) - unique_users)
      / NULLIF(LAG(unique_users) OVER (ORDER BY unique_users DESC), 0),
    1) AS drop_pct
  FROM screen_counts
)
SELECT *
FROM ordered
ORDER BY unique_users DESC;
```

**How to read it:** `drop_pct` is the % of users lost between the previous screen
and this one. Anything above 20% warrants UX review.

---

## Q2 — Day-0 completion: % of users who log all 4 pillars on their first day

```sql
WITH new_users AS (
  -- users whose first screen_view was within the window
  SELECT
    user_id,
    MIN(created_at) AS first_seen
  FROM audit_events
  WHERE event = 'screen_view'
  GROUP BY user_id
),
day0_pillar_counts AS (
  SELECT
    ae.user_id,
    COUNT(DISTINCT ae.metadata->>'pillar') AS pillars_logged
  FROM audit_events ae
  JOIN new_users nu ON ae.user_id = nu.user_id
  WHERE
    ae.event = 'pillar_capture_completed'
    AND ae.created_at BETWEEN nu.first_seen AND nu.first_seen + INTERVAL '24 hours'
  GROUP BY ae.user_id
)
SELECT
  COUNT(*)                                                    AS total_new_users,
  COUNT(*) FILTER (WHERE pillars_logged = 4)                  AS completed_day0,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE pillars_logged = 4) / NULLIF(COUNT(*), 0),
  1)                                                          AS pct_completed_day0
FROM day0_pillar_counts;
```

**Benchmark target:** ≥ 70 % on Day 0 before public launch.

---

## Q3 — Trial conversion: % of trial users who upgrade to paid

```sql
WITH trial_starts AS (
  SELECT DISTINCT user_id
  FROM audit_events
  WHERE event = 'subscription_webhook'
    AND metadata->>'action' = 'trial_start'
),
conversions AS (
  SELECT DISTINCT ae.user_id
  FROM audit_events ae
  JOIN trial_starts ts ON ae.user_id = ts.user_id
  WHERE ae.event = 'subscription_webhook'
    AND ae.metadata->>'action' IN ('subscription_renewed', 'subscription_purchased')
)
SELECT
  COUNT(DISTINCT ts.user_id)    AS trial_users,
  COUNT(DISTINCT c.user_id)     AS converted_users,
  ROUND(
    100.0 * COUNT(DISTINCT c.user_id) / NULLIF(COUNT(DISTINCT ts.user_id), 0),
  1)                            AS conversion_pct
FROM trial_starts ts
LEFT JOIN conversions c ON ts.user_id = c.user_id;
```

**Fallback:** If webhook events are sparse, cross-reference `users.subscription_status`
directly:
```sql
SELECT
  COUNT(*)                                           AS total_users,
  COUNT(*) FILTER (WHERE subscription_status = 'paid')  AS paid,
  ROUND(100.0 * COUNT(*) FILTER (WHERE subscription_status = 'paid') / NULLIF(COUNT(*), 0), 1) AS pct_paid
FROM users
WHERE deleted_at IS NULL;
```

---

## Q4 — Median time from screen open to pillar capture complete

Measures how long (in seconds) users take to complete a pillar after opening the
capture screen. Use this to detect UX bottlenecks per pillar.

```sql
WITH opens AS (
  SELECT
    user_id,
    metadata->>'pillar' AS pillar,
    created_at          AS opened_at
  FROM audit_events
  WHERE event = 'pillar_capture_started'
),
completes AS (
  SELECT
    user_id,
    metadata->>'pillar'    AS pillar,
    metadata->>'time_ms'   AS time_ms_str,
    created_at             AS completed_at
  FROM audit_events
  WHERE event = 'pillar_capture_completed'
    AND metadata->>'time_ms' IS NOT NULL
),
durations AS (
  SELECT
    o.pillar,
    (c.time_ms_str::numeric / 1000) AS duration_sec
  FROM opens o
  JOIN completes c
    ON  o.user_id = c.user_id
    AND o.pillar  = c.pillar
    AND c.completed_at BETWEEN o.opened_at AND o.opened_at + INTERVAL '10 minutes'
)
SELECT
  pillar,
  COUNT(*)                                              AS sessions,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_sec)::numeric, 1) AS median_sec,
  ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY duration_sec)::numeric, 1) AS p90_sec
FROM durations
GROUP BY pillar
ORDER BY median_sec DESC;
```

**How to read it:** `median_sec` is the typical completion time.
If `p90_sec` is more than 3× the median, a significant tail of users are struggling.

---

## Useful ad-hoc snippets

### Events in the last 24 hours by type
```sql
SELECT event, COUNT(*) AS n
FROM audit_events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event
ORDER BY n DESC;
```

### Most active screens today
```sql
SELECT metadata->>'screen' AS screen, COUNT(*) AS views
FROM audit_events
WHERE event = 'screen_view'
  AND created_at >= CURRENT_DATE
GROUP BY metadata->>'screen'
ORDER BY views DESC
LIMIT 20;
```

### Audit table size (row count + estimated disk)
```sql
SELECT
  reltuples::bigint                          AS estimated_rows,
  pg_size_pretty(pg_total_relation_size(oid)) AS total_size
FROM pg_class
WHERE relname = 'audit_events';
```
