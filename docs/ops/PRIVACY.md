# 4Wins Privacy & Data Handling

## Principle

We collect the minimum data needed to deliver the product.  
We never sell, rent, or trade user data.

---

## What we collect

| Data | Purpose | Stored where |
|---|---|---|
| Apple / Google user ID | Authentication | `users.external_id` |
| Email (optional, from provider) | Account identification | `users.email` |
| Tradition selection | Spiritual prompt personalisation | `users.tradition` |
| Identity statement | Reflection prompt | `users.identity_statement` (server-side) |
| Cue label + time | Push notification scheduling | `users.cue_*` |
| Daily entries (text / voice) | Core product functionality | `entries.raw_text`, stored encrypted |
| Push token | Notification delivery | `notifications.token` |
| Audit events | Anonymous product analytics | `audit_events` — no PII allowed (enforced) |
| Subscription status | Feature gating | `users.subscription_status` |

---

## What we do NOT collect

- Precise location
- Contacts / address book
- Health data server-side (processed on-device only)
- Behavioural advertising data
- Data from third-party SDKs with tracking

---

## Data sovereignty

All data is stored in the region selected at Replit project creation.  
Users in the EU may request data export or deletion at any time.

---

## PII scrubbing rules

### Backend (Sentry)

- `request.data` stripped before sending to Sentry
- `user` reduced to `{ id }` only
- Fields `email`, `identity_statement`, `raw_text`, `custom_tradition_text` purged from extras

### Client telemetry (`/v1/audit`)

Allowlist-only metadata keys:

```
screen, locale, mode, pillar, input_method,
time_ms, action, banner, screen_from, screen_to,
attempt_count, error_code
```

Any key not on this list → HTTP 422 (rejected server-side).  
Text content never enters telemetry.

### Voice transcription

Audio uploaded directly to our API over TLS.  
Transcribed by OpenAI Whisper. Audio buffer discarded immediately after transcription.  
Transcript stored as `entries.raw_text` — encrypted at rest.

---

## Retention & deletion

| Trigger | Action |
|---|---|
| User taps "Delete account" | Account soft-deleted, visible to user for 30 days |
| 30 days after soft-delete | Hard delete: all entries, days, tokens, subscriptions |
| Audit events | Purged after 90 days (rolling) |
| Push token | Deleted on account deletion |

---

## Legal

- Privacy Policy: https://4wins.me/privacy
- Terms of Service: https://4wins.me/terms
- Data requests: privacy@4wins.me

---

## App Store disclosures (required)

### Data linked to you
- User ID
- Email address (optional)

### Data used to track you
- None

### Health & Fitness data
- Steps, active energy, workout minutes — used on-device only to auto-log the Physical pillar. Not transmitted to our servers in identifiable form.
