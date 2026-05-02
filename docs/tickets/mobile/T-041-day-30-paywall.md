# T-041 — Day-30 paywall screen

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-030, T-011, T-012
**Implements PRD:** §3 Flow E (the conversion moment), §4 spec for screen 19
**Brand bible:** §3 (no urgency), §8 spec, §9 rejection list

## Goal

The day-30 conversion screen. Three swipeable insight cards (the third paywalled). "Start 14-day trial" / "Continue free, 30-day history" CTAs. No urgency timers, no struck-through prices.

## What to build

1. Modal route `(modals)/paywall.tsx`.
2. **Trigger:** when user opens app on the 30th distinct day-with-data AND insights have been generated. The home screen detects this, sets a `should_show_paywall` flag, and pushes the modal as an interstitial before rendering home.
3. **Layout:** PRD §4 spec — headline, 3 swipeable cards, CTA stack.
4. **Card 3 (paywalled):** payload blurred, label "Cross-pillar correlation," CTA "Unlock with trial."
5. **CTAs:**
   - Primary: "Start 14-day trial" → `POST /v1/subscription/start_trial`, dismiss modal, return to home.
   - Secondary: "Continue free, 30-day history" → set local flag, dismiss modal.
6. After dismissal (either path), the paywall does NOT re-trigger automatically — re-entry requires Settings → Subscription.
7. **Re-trigger conditions:** if free user's insight blur is tapped again → re-open this paywall.

## Files to create / modify

```
apps/mobile/app/(modals)/paywall.tsx
apps/mobile/components/paywall/
  InsightCard.tsx
  PaywalledCard.tsx
  TrialCTA.tsx
apps/mobile/hooks/useShouldShowPaywall.ts
apps/mobile/lib/paywall_state.ts                 # local persisted state
apps/mobile/__tests__/paywall.test.tsx
```

## Acceptance criteria

- [ ] Triggers exactly once after user hits 30th day. Subsequent home opens don't re-trigger.
- [ ] Layout matches PRD §4 spec.
- [ ] Three cards render from `GET /v1/insights` data; paywalled card has blur + "Unlock with trial" CTA.
- [ ] No struck-through prices, no countdown timers, no "limited offer," no exclamation marks.
- [ ] "Start trial" calls `/v1/subscription/start_trial`. On success, status updates locally; trial-ends date visible in Settings.
- [ ] "Continue free" sets local flag and dismisses. User stays on free with 30-day history rolling.
- [ ] Tapping any blurred insight (in History or via insights endpoint) re-opens this paywall.
- [ ] Tests: trigger condition, both CTA paths, re-open via blurred insight tap.
- [ ] Brand rejection list §9 passes.

## Non-goals

- Renewal flow (auto via App Store/Play; no in-app handling).
- Win-back offers.
- Promo codes (App Store/Play handle).
- A/B testing infrastructure (v1.5).

## Notes for the agent

- The "Start trial" doesn't require an Apple/Google subscription receipt at this moment — it's server-controlled (T-012). The user attaches a real subscription on day 14 conversion via App Store sheet.
- Keep the price line subtle: "$79 a year. No card needed for the trial." in body text, not a giant pricing card.
- Use the paywall's own modal presentation, not the `(modals)/voice` style. Different visual weight.
- The paywall has a small close X top-right; tapping it equals tapping "Continue free."
