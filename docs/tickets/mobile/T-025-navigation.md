# T-025 — Navigation skeleton

**Area:** mobile
**Estimate:** 30 min
**Depends on:** T-022
**Implements PRD:** §3 (screen inventory)
**Brand bible:** §8 (no tab bar, no Profile tab)

## Goal

Establish the expo-router navigation tree that all screen tickets will populate. No screens beyond placeholders — just the structure.

## What to build

1. Root stack with three groups: `(onboarding)`, `(app)`, `(modals)`.
2. **No bottom tab bar.** The brand bible explicitly bans this. The single home screen is the surface; secondary screens are pushed onto the stack.
3. Auth gate: a `_layout.tsx` at the root that redirects to `(onboarding)` if no auth token, else to `(app)`.
4. Onboarding routes are linear with a programmatic-only navigation guard — users can't deep-link mid-onboarding.
5. Modal presentation for the day-30 paywall (T-041) and voice overlay (T-034).
6. Screen transitions per brand §7: cross-fade with 8px Y-translation, 500ms.

## Files to create / modify

```
apps/mobile/app/
  _layout.tsx                     # auth gate
  index.tsx                       # redirector (no UI of its own)
  (onboarding)/
    _layout.tsx                   # linear stack, no back gesture on critical screens
    welcome.tsx
    pillars.tsx
    tradition.tsx
    identity.tsx
    cue.tsx
    notifications.tsx
    day-zero.tsx
    first-close.tsx
  (app)/
    _layout.tsx                   # the in-app stack
    home.tsx
    pillar/[pillar].tsx           # dynamic route for pillar capture
    history.tsx
    history/[date].tsx
    weekly/[isoWeek].tsx
    settings.tsx
  (modals)/
    _layout.tsx                   # presentation: 'modal'
    voice.tsx
    paywall.tsx
    subscription.tsx

apps/mobile/lib/auth_state.ts     # placeholder; T-026 fills in

apps/mobile/__tests__/navigation.test.ts
```

## Acceptance criteria

- [ ] Cold start with no auth token routes to `(onboarding)/welcome`.
- [ ] Cold start with valid auth token routes to `(app)/home`.
- [ ] `(onboarding)` stack hides the back button on `welcome`, `pillars`, `tradition` (commit-required screens).
- [ ] `(app)` stack uses cross-fade + 8px Y-translation, 500ms.
- [ ] Modal routes (`voice`, `paywall`) present from bottom with the OS-default modal animation, NOT the brand transition.
- [ ] No bottom tab bar anywhere in the tree.
- [ ] Settings is reachable from home via a single icon top-right (placeholder gear); back from settings returns to home.
- [ ] Tests assert: every screen path resolves to an existing file; auth gate redirects correctly under both states.

## Non-goals

- No screen UI (other tickets).
- No sign-in flow yet (T-026).
- No deep linking (v1.5 if needed).
- No iPad split-view layouts (phone-only per PRD).

## Notes for the agent

- Use `expo-router` v3+ typed routes. Generate types via `npx expo-router-typed-routes` or the equivalent in your version.
- Auth gate: read `accessToken` from `expo-secure-store`. T-026 will populate it.
- For "no back gesture" on commit-required screens, set `gestureEnabled: false` and `headerBackVisible: false`.
- Cross-fade transition: customize Stack.Screen options with `animation: 'fade'` and a small slide via `transitionSpec`.
- Don't render anything in `index.tsx` — it's a redirector. Use `<Redirect />` from expo-router.
- Modal headers: hide them. Voice and paywall manage their own top-bar content.
- The `pillar/[pillar]` route param is one of: `mental | financial | spiritual | physical`. Validate at runtime; redirect to home if invalid.
