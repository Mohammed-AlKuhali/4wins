# T-027 — Onboarding: welcome + pillars + tradition

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-026
**Implements PRD:** §2 Flow A steps 1–3
**Brand bible:** §3 (sample copy locked), §4, §5, §8

## Goal

Build the first three onboarding screens after welcome: pillars introduction, tradition selection, and the routing logic that follows. The welcome screen is part of T-026; this ticket builds what comes after sign-in for new users.

## What to build

1. **Screen 02 — Pillars introduction** (`(onboarding)/pillars.tsx`)
   - Full-bleed Fraunces, copy from brand §3 sample (verbatim).
   - Single CTA "Continue" at bottom.
   - No back gesture.
2. **Screen 03 — Tradition selection** (`(onboarding)/tradition.tsx`)
   - Copy from brand §3 sample (verbatim).
   - Five buttons: Christian / Stoic / Buddhist / Secular / Custom.
   - Tapping Custom reveals a single-line text input below: "Name your own."
   - On select, PATCH `/v1/me { tradition, custom_tradition_text? }`, navigate to `(onboarding)/identity`.
3. State across screens stored in a `OnboardingContext` so partial data isn't lost on app backgrounding.
4. Both screens auto-submit-and-advance on tap; no extra "Save" affordance.

## Files to create / modify

```
apps/mobile/app/(onboarding)/pillars.tsx
apps/mobile/app/(onboarding)/tradition.tsx
apps/mobile/app/(onboarding)/_layout.tsx           # wrap in OnboardingContext
apps/mobile/lib/onboarding_context.tsx
apps/mobile/components/CenteredPage.tsx            # shared layout used by all onboarding screens
apps/mobile/__tests__/onboarding_1.test.tsx
```

## Acceptance criteria

- [ ] Pillars screen renders the locked copy verbatim, Fraunces Light 40/48 stacked.
- [ ] Tradition screen shows 5 large buttons in a single column. Selected state visible (filled vs outlined).
- [ ] Tapping Custom reveals a text input with placeholder "Name your own"; entering text + tapping Continue submits with `tradition='custom', custom_tradition_text=<text>`.
- [ ] `PATCH /v1/me` is called with the selection; navigation only proceeds on success.
- [ ] On API error, an inline message: "Try that again. We'll wait." (brand bible §3 verbatim).
- [ ] No emoji, no "✨", no exclamation marks (run rejection list §9).
- [ ] Tests: rendering snapshot, tradition selection POSTs correctly, custom path works.

## Non-goals

- Identity / cue / notifications screens (T-028).
- Day-0 ritual (T-029).
- Skip / "I'll do this later" — onboarding is required.

## Notes for the agent

- `CenteredPage` shell: SafeArea, top spacer (40pt), centered content vertically, bottom CTA + 32pt margin.
- Buttons in tradition screen: 48pt tall, full-width, 12pt vertical spacing, off-black filled when selected, hairline outlined when not.
- Use `react-query` mutation for the PATCH; show a subtle pulse on the CTA while pending.
- Don't allow empty `custom_tradition_text` if Custom is selected (validate locally).
