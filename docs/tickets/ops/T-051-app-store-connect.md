# T-051 — App Store Connect setup

**Area:** ops
**Estimate:** 60 min
**Depends on:** T-021
**Implements PRD:** §0 (TestFlight by week 6)
**Brand bible:** §3 (App Store screenshot copy)

## Goal

Provision the App Store Connect app record, bundle ID, capabilities, in-app purchase products, and prepare metadata. Doesn't ship the app — preps everything for TestFlight (T-053).

## What to build (mostly configuration, not code)

1. **Apple Developer account** (assumed in place; if not, the user provisions).
2. **Bundle ID:** `me.4wins.app` — register in dev portal with capabilities:
   - Sign in with Apple
   - Push Notifications
   - HealthKit
   - App Groups (`group.me.4wins.app` for widget)
   - In-App Purchase
3. **App Store Connect app record** with:
   - Name: `4Wins`
   - Subtitle: `Daily four-pillar ritual`
   - Primary category: Health & Fitness (Lifestyle as secondary)
   - Bundle ID linked.
4. **In-app purchase products:**
   - `me.4wins.yearly` ($79/yr, auto-renewing subscription)
   - `me.4wins.monthly` ($7.99/mo, auto-renewing subscription)
   - Both in a single subscription group "4Wins Premium"
5. **App Store Server Notifications V2** webhook URL pointed at `/v1/webhooks/apple`.
6. **Privacy policy URL + Terms URL** — placeholders pointing to `https://4wins.me/privacy` and `https://4wins.me/terms` (real pages later).
7. **App privacy details** — declare data collected per Apple's privacy questionnaire:
   - Email (linked to user, used for auth)
   - User content (entries — linked, NOT used for tracking)
   - Health data (Physical pillar — linked, never leaves user's device or our scope)
   - Audio samples (voice transcription — NOT linked, NOT stored)
   - No analytics on entry content.
8. **App Store screenshots placeholder** — 6 required at 6.7" (iPhone Pro Max) per PRD §11.
9. **Sign in with Apple service ID** + JWT key for backend (the `APPLE_PRIVATE_KEY` in T-001/T-003).

## Acceptance criteria (configuration checklist)

- [ ] Bundle ID `me.4wins.app` exists with all 5 capabilities enabled.
- [ ] App record exists, name "4Wins."
- [ ] Two IAP products created in a single subscription group.
- [ ] Server notifications webhook configured with our endpoint URL.
- [ ] Sign in with Apple key downloaded; private key configured in backend env.
- [ ] App privacy details questionnaire completed truthfully matching our data flows.
- [ ] Privacy + Terms URLs entered (pointing to placeholders that exist).
- [ ] Screenshot placeholders uploaded (6 required) — final designs come from a separate launch ticket.

## Non-goals

- Final marketing copy / keywords (separate launch phase).
- Screenshot final designs.
- App Store Optimization (ASO) keyword research.
- Submitting for review (T-053).

## Notes for the agent

This ticket is mostly configuration in the Apple Developer Portal + App Store Connect. The agent should produce:
1. A step-by-step checklist for the user to follow in the portals.
2. The exact strings/IDs/URLs to enter at each step.
3. A final `docs/ops/app-store-config.md` documenting what was configured (bundle ID, IAP product IDs, webhook URL, etc.) so future tickets reference it.

The PRD's App Store screenshot copy comes from brand bible §11 — use the locked strings, no marketing fluff.
