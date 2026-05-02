# Client Telemetry

## Endpoint

```
POST /v1/audit
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request body

```json
{
  "event_type": "screen_view",
  "metadata": {
    "screen": "home",
    "locale": "en"
  }
}
```

### Allowed metadata keys (server-enforced allowlist)

| Key | Type | Description |
|---|---|---|
| `screen` | string | Current screen name |
| `locale` | string | Device locale tag |
| `mode` | string | `dark` or `light` |
| `pillar` | string | `mental`, `financial`, `spiritual`, `physical` |
| `input_method` | string | `voice`, `type`, `lazy_path`, etc. |
| `time_ms` | number | Elapsed time in milliseconds |
| `action` | string | Button/action name |
| `banner` | string | Banner/paywall variant name |
| `screen_from` | string | Navigation source screen |
| `screen_to` | string | Navigation target screen |
| `attempt_count` | number | Retry count |
| `error_code` | string | Non-sensitive error code |

Any key **not** on this list → HTTP 422. Server rejects the entire event.

### Event types

| Event | When |
|---|---|
| `screen_view` | Every screen mount |
| `onboarding_screen_completed` | Each onboarding step completed |
| `pillar_capture_started` | User opens a pillar capture screen |
| `pillar_capture_completed` | Entry saved successfully |
| `paywall_shown` | Paywall modal displayed |
| `paywall_action` | User taps trial/free/dismiss |
| `day_closed` | Day is closed (all 4 pillars logged) |
| `entry_created` | Individual entry saved |

---

## Mobile integration

Use `track()` from `apps/mobile/lib/telemetry.ts`:

```ts
import { track } from '../lib/telemetry';

track('screen_view', { screen: 'home', locale: 'en' });
```

Errors are swallowed silently — telemetry must never break the app.

---

## Querying events (ops)

```sql
-- Event counts by type, last 7 days
SELECT event_type, COUNT(*) AS cnt
FROM audit_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY cnt DESC;

-- Daily active users (proxy)
SELECT DATE(created_at) AS day, COUNT(DISTINCT user_id) AS dau
FROM audit_events
WHERE event_type = 'screen_view'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;

-- Paywall conversion funnel
SELECT
  SUM(CASE WHEN event_type = 'paywall_shown' THEN 1 ELSE 0 END) AS shown,
  SUM(CASE WHEN event_type = 'paywall_action' AND metadata->>'action' = 'start_trial' THEN 1 ELSE 0 END) AS trials
FROM audit_events
WHERE created_at > NOW() - INTERVAL '30 days';

-- Pillar completion rates
SELECT
  metadata->>'pillar' AS pillar,
  COUNT(*) AS cnt
FROM audit_events
WHERE event_type = 'pillar_capture_completed'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY pillar
ORDER BY cnt DESC;
```
