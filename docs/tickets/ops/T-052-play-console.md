# T-052 — Google Play Console setup

**Area:** ops
**Estimate:** 60 min
**Depends on:** T-021
**Implements PRD:** §0 (Android v1)
**Brand bible:** §3 (Play Store metadata)

## Goal

Mirror T-051 for Google Play. Provision app record, capabilities, IAP products, RTDN webhook, and Data Safety form.

## What to build (configuration)

1. **Google Play Developer account** (assumed in place).
2. **App record** in Play Console with:
   - Bundle ID: `me.4wins.app`
   - Title: `4Wins`
   - Short description ≤80 chars: `A four-pillar daily ritual.`
   - Category: Health & Fitness
3. **IAP products:** same product IDs as iOS (`me.4wins.yearly`, `me.4wins.monthly`), in a single subscription group.
4. **Real-time Developer Notifications (RTDN):** Pub/Sub topic + push subscription pointing at `/v1/webhooks/google`. Service-account JSON saved as `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` env in backend.
5. **Data Safety form:** declare same data practices as iOS (T-051). No third-party trackers, no entry data shared.
6. **Sensitive permissions:** declare HEALTH_CONNECT permission usage with rationale ("auto-detect movement to log Physical pillar").
7. **Sign in with Google:** OAuth client IDs (iOS, Android, Web — only iOS + Android needed; Web client ID is required by Google as the "server" for token verification).

## Acceptance criteria

- [ ] App record exists, package name `me.4wins.app`.
- [ ] Two subscription products created with matching IDs to iOS.
- [ ] RTDN topic + subscription configured; backend webhook receives test message.
- [ ] Data Safety form filled out truthfully.
- [ ] Three OAuth client IDs created (iOS, Android, Web) — IDs added to backend env (`GOOGLE_CLIENT_ID_IOS`, `GOOGLE_CLIENT_ID_ANDROID`, web for verification).
- [ ] Document configuration in `docs/ops/play-console-config.md`.

## Non-goals

- Final store listing copy / screenshots.
- Pre-registration / pre-launch reports.
- Production release rollout (a separate launch ticket).

## Notes for the agent

- Same approach as T-051 — produce a step-by-step checklist + final config doc.
- Web OAuth client ID: Google requires a "Web application" client ID even for native sign-in, because it's used server-side for token verification. The mobile uses iOS/Android client IDs; the backend audience-checks against all three.
- For Health Connect, also declare in `app.config.ts` Android permissions.
