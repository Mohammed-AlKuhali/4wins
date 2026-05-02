# T-042 — Subscription manage screen

**Area:** mobile
**Estimate:** 30 min
**Depends on:** T-041
**Implements PRD:** §3 screen 20
**Brand bible:** §3 (no urgency)

## Goal

Lightweight in-app subscription status surface. Most management happens in the App Store / Play Store; this screen shows status and links out cleanly.

## What to build

A single screen reachable from Settings → Subscription:

- **Free user:** "You're on the free plan. 30 days of history kept." Button: "Start 14-day trial" → reopens paywall T-041.
- **Trial user:** "Trial ends [date]. After that, $79/year via [App Store/Play]." Button: "Manage in [Store]" → `Linking.openURL` to platform manage page.
- **Paid user:** "Paid through [date]. $79/year." Button: "Manage in [Store]."
- **Expired:** "Your subscription expired on [date]. Reactivate in [Store]." Button: "Manage in [Store]."

## Files to create / modify

```
apps/mobile/app/(modals)/subscription.tsx
apps/mobile/__tests__/subscription_manage.test.tsx
```

## Acceptance criteria

- [ ] Each of 4 states (free / trial / paid / expired) renders correct copy.
- [ ] Button opens platform-native subscriptions page via `Linking.openURL`.
- [ ] No upsell scare-copy, no "Reactivate now!" exclamations.
- [ ] Tests for each of 4 states.

## Non-goals

- In-app cancellation (App Store/Play handle).
- Receipt restore button (auto on app launch; explicit button only if needed in v1.5).

## Notes for the agent

- Status copy must include the next billing date or expiry — fetch from `GET /v1/subscription/status`.
- Date formatting: locale-aware `Intl.DateTimeFormat`.
- "Manage in App Store" / "Manage in Play Store" — pick the string from `Platform.OS`.
