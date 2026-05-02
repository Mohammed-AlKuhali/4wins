# T-054 — Error monitoring (Sentry)

**Area:** ops
**Estimate:** 30 min
**Depends on:** T-021, T-001
**Implements PRD:** §8 (NFRs — crash-free >99.5%)

## Goal

Wire Sentry into both backend (Replit) and mobile (Expo) for crash + error tracking. Privacy-first: scrub PII from breadcrumbs, never send entry text.

## What to build

1. **Sentry account + project:** create one project for mobile, one for backend.
2. **Backend:** install `@sentry/node`, init in `src/index.ts`, capture unhandled errors, scrub user emails / entry text from event payloads.
3. **Mobile:** install `sentry-expo`, init in `App.tsx`/`_layout.tsx`, configure source maps upload via EAS, scrub PII.
4. **PII scrubbing rules (both):**
   - Strip request bodies entirely from breadcrumbs.
   - Strip `email`, `identity_statement`, `raw_text`, `custom_tradition_text` from any event payload.
   - User context = user id only, no email.
5. **Release tagging:** EAS Build's release name is auto-attached to mobile events; backend tags with `git_sha`.
6. **Sample rate:** 100% for v1 (low volume); reduce to 25% if quota becomes a concern.

## Files to create / modify

```
src/lib/sentry.ts                          # backend init + scrub
src/index.ts                               # call sentry.init() at boot
apps/mobile/lib/sentry.ts                  # mobile init + scrub
apps/mobile/app/_layout.tsx                # call init
package.json (both)                        # add @sentry/node, sentry-expo
eas.json                                   # source-maps upload hook
```

## Acceptance criteria

- [ ] Triggering a deliberate error in backend appears in the backend Sentry project within 30 sec.
- [ ] Triggering a deliberate error in mobile appears in the mobile Sentry project.
- [ ] Source maps work: stack traces show TS source, not minified JS.
- [ ] PII scrub: trigger an error in a code path that touches `entries.raw_text` — verify the captured event does NOT contain the text.
- [ ] User context attached: events include user id, no email.
- [ ] Release tagging: backend events carry `git_sha`; mobile events carry the EAS release name.

## Non-goals

- Performance monitoring / tracing (v1.5 if needed).
- Custom dashboards (Sentry's defaults are fine).
- Slack alert integration.

## Notes for the agent

- `SENTRY_DSN_BACKEND` and `SENTRY_DSN_MOBILE` env vars.
- Sentry's `beforeSend` hook is where PII scrubbing happens — strip before transmission.
- Don't attach breadcrumbs that include request bodies. Breadcrumbs include URL + status code + duration only.
- Add a comment in `lib/sentry.ts` linking to PRD §8 + the privacy note in PRD §5.
