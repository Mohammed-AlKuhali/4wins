# T-032 — Pillar capture: Spiritual (5 traditions)

**Area:** mobile
**Estimate:** 60 min
**Depends on:** T-031
**Implements PRD:** §3 screen 12, §2 Flow B (tradition routing)
**Brand bible:** §3 (5 tradition variants verbatim)

## Goal

Build the Spiritual pillar capture variant. Reads `users.tradition`, renders the corresponding prompt verbatim from brand §3, and uses the shared shell from T-031.

## What to build

1. **Five tradition prompts** (lock these strings in `lib/spiritual_prompts.ts`):
   - Christian: "What are you grateful to God for today?"
   - Stoic: "What's in your control today, and what isn't?"
   - Buddhist: "What did you notice without attaching to it?"
   - Secular: "What matters today beyond what's urgent?"
   - Custom: render `users.custom_tradition_text` if set, else fallback to Secular.
2. Spiritual variant of the capture shell, importing T-031's `<PillarCaptureShell>`.
3. Lazy path button label: "Log a tiny Spiritual win."
4. Edge case: if `users.tradition` is null (somehow missed onboarding), default to Secular and surface a small hint to revisit Settings.

## Files to create / modify

```
apps/mobile/components/pillar_capture/Spiritual.tsx
apps/mobile/lib/spiritual_prompts.ts
apps/mobile/app/(app)/pillar/[pillar].tsx              # extend router to handle 'spiritual'
apps/mobile/__tests__/pillar_capture_spiritual.test.tsx
```

## Acceptance criteria

- [ ] Tradition is read from `users.tradition` (cached).
- [ ] Each of the 5 traditions shows the locked prompt verbatim.
- [ ] Custom tradition uses `users.custom_tradition_text` as the prompt; if empty, falls back to Secular's prompt + a one-line note: "Set a custom prompt in Settings."
- [ ] All voice/type/lazy paths work via the shared shell.
- [ ] Tests: render with each of 5 traditions, custom-empty fallback.
- [ ] Brand rejection list §9 passes.

## Non-goals

- No tradition switching from this screen (Settings — T-038).
- No content library (no daily Bible verse, no Stoic quote of the day) — v1 is pure prompt + free-form response.
- No prompts beyond the 5 traditions (these are the only options in v1).

## Notes for the agent

- Lock the prompt strings in a single file (`spiritual_prompts.ts`) so future ticket-T-045 (i18n) can pick them up cleanly.
- Don't switch traditions silently — if `users.tradition` changes, the next capture session uses the new prompt; we don't migrate past entries.
- For Buddhist and Christian voice transcription specifically, ensure Whisper handles the religious vocabulary — should be fine, but log the transcript language for diagnostics.
