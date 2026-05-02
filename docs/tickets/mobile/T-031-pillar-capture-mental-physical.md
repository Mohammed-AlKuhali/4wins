# T-031 — Pillar capture: Mental + Physical

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-030
**Implements PRD:** §3 screens 10, 13; §4 (capture shell), §2 Flow B
**Brand bible:** §3 (capture prompts), §8 (full-bleed)

## Goal

Build the shared pillar-capture screen shell + the Mental and Physical pillar variants. Capture shell is reused by Spiritual (T-032) and Financial (T-033).

## What to build

1. `<PillarCaptureShell>` — generic full-bleed layout (close X top-left, prompt centered, mic button big, "Type instead" / "Lazy path" small below).
2. **Mental** route: prompt = "What did you learn today?" Lazy path button "Log a tiny Mental win."
3. **Physical** route:
   - If HealthKit/Health Connect detected movement today (T-044), prompt = "You moved today. Logged." with auto-saved entry showing → user just taps "Confirm." (entry already created server-side via T-044).
   - Otherwise prompt = "Move your body. One minute counts." Lazy path "Logged" / "Tell me what I did" (opens type input).
4. Voice and type inputs both go through the shared shell.
5. On successful POST, navigate back to home — home will show the updated Quad arc.
6. If the AI tagger suggests a different pillar (`pillar_mismatch_hint` from T-006), show the soft prompt: "That sounded more like a [pillar] win. Log there instead?" with [Yes] / [Keep here].

## Files to create / modify

```
apps/mobile/app/(app)/pillar/[pillar].tsx              # router
apps/mobile/components/pillar_capture/
  PillarCaptureShell.tsx
  Mental.tsx
  Physical.tsx
  LazyPathButton.tsx
  TypeInput.tsx
  PillarMismatchHint.tsx
apps/mobile/__tests__/pillar_capture_mental_physical.test.tsx
```

## Acceptance criteria

- [ ] `pillar/[pillar]` validates pillar param at runtime; invalid → redirect to home.
- [ ] Mental shows the locked prompt verbatim (Fraunces Light 40/48).
- [ ] Lazy path one-tap creates an entry with `input_method=lazy_path`, no text.
- [ ] Voice and type inputs route through shell + create entries with the right `input_method`.
- [ ] Physical: if HealthKit data exists for today, prompt updates accordingly. Confirm button creates `input_method=healthkit_auto` entry with `structured_data.duration_min` etc.
- [ ] Mismatch hint surfaces when API response includes `pillar_mismatch_hint`. Tapping "Yes, log as [pillar]" creates the entry under the suggested pillar instead.
- [ ] No tab bar visible during capture.
- [ ] On success, navigate back; home animates the new arc fill.
- [ ] Brand rejection list §9 passes.
- [ ] Tests: shell render, Mental lazy path, Mental voice + mismatch suggested, Physical HealthKit auto-detect, Physical manual entry.

## Non-goals

- Spiritual (T-032), Financial (T-033) — different forms.
- Voice overlay (T-034) — that's the modal; this ticket triggers it but doesn't implement it.
- HealthKit data fetching itself (T-044) — this ticket consumes T-044's auto-created entry.
- Editing past entries.

## Notes for the agent

- The shell takes children for the prompt + custom action area; Mental.tsx and Physical.tsx are thin variant wrappers.
- Use the modal route `/(modals)/voice` for the voice overlay — present, await result, save entry.
- Type input expands to a full-screen textarea via a presentation push (not modal); has its own back button.
- For Physical, check `users.timezone` and the latest `/v1/today` entries — if any entry on today has `input_method=healthkit_auto`, render the "You moved today. Logged." state.
- The mismatch hint UI: a non-modal banner that appears below the prompt for 5 seconds before auto-dismissing — user can act on it or ignore.
