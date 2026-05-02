# T-033 — Pillar capture: Financial (3-button)

**Area:** mobile
**Estimate:** 30 min
**Depends on:** T-031
**Implements PRD:** §3 screen 11, §0 product decision #6
**Brand bible:** §3 (financial prompt verbatim)

## Goal

The Financial pillar variant — a 3-button form, NOT voice-first. Mindset check, not transactions.

## What to build

1. Locked prompt: "Did your money behavior today match the person you're becoming?"
2. Three large buttons stacked: "Yes" / "Not quite" / "Not today."
3. After tapping, an OPTIONAL "why?" prompt appears with a small voice/type input. User can skip with another tap on "Continue" or skip implicitly by waiting 3 seconds → auto-saves and dismisses.
4. The entry is created with `input_method=type` (or `voice` if used), `structured_data={ behavior_match: 'yes'|'not_quite'|'not_today' }`, optional `raw_text`.
5. No bank linking, no transaction list, no spend amount fields. Per PRD §9 hard rule.

## Files to create / modify

```
apps/mobile/components/pillar_capture/Financial.tsx
apps/mobile/app/(app)/pillar/[pillar].tsx              # extend for 'financial'
apps/mobile/__tests__/pillar_capture_financial.test.tsx
```

## Acceptance criteria

- [ ] Prompt rendered verbatim in Fraunces Light 40/48.
- [ ] Three buttons stacked vertically, equal width, 60pt tall.
- [ ] Selecting any button creates the entry server-side with `behavior_match` value.
- [ ] After selection, "why?" prompt appears in smaller type with voice + type buttons. User can skip.
- [ ] If user adds a "why?" via voice or type, PATCH the entry's `raw_text`.
- [ ] On 3-second idle after selection (no "why?"), auto-dismiss to home.
- [ ] No transaction-shaped UI (no $ symbol, no amount input, no "from account X").
- [ ] Brand rejection list §9 passes (no nagging copy).
- [ ] Tests: each of 3 button paths, optional why submission, auto-dismiss.

## Non-goals

- No bank/Plaid integration (PRD §9).
- No "track expenses" workflow.
- No category labels.

## Notes for the agent

- Keep the "why?" prompt subtle. Brand bible §3: this is a 5-second mindset check.
- If the user picks "Not today," the brand voice doesn't shame — the next screen says nothing judgmental. The entry is logged; the day moves on.
- The 3 buttons map to enum values exactly: `yes`, `not_quite`, `not_today`.
