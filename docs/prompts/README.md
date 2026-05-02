# Phase 6 — Replit Agent Prompts

> Each prompt here is a **single copy-pasteable block** for Replit Agent. Pick one, copy the entire file body (between the `---PROMPT START---` / `---PROMPT END---` markers), paste into Replit Agent.

## Status

This phase is being built **iteratively**, not in one batch. Reason: writing 38 prompt wrappers without empirical signal from Replit Agent would be guessing. The first prompt (`T-001.md`) is production-ready; subsequent prompts will be authored after we observe how T-001 behaves and refine the wrapper accordingly.

## How a prompt is built

Each prompt = **wrapper** + **ticket body**. The wrapper inlines:

1. Project context (what 4Wins is, the stack, the conventions)
2. Brand bible §9 rejection list (relevant items, even for backend tickets — naming, copy)
3. Relevant PRD sections excerpted
4. The ticket body verbatim
5. A "before completing" postamble (verify acceptance criteria, run rejection list)

So Replit Agent has everything in one input, no doc-tree navigation required.

## Files

| File | Status |
|---|---|
| `_template.md` | The wrapper template. Boilerplate for new prompts. |
| `T-001.md` | ✅ Ready — start here. |
| `T-002.md` ... `T-055.md` | Authored after T-001 lands; each one ~15 min of refinement. |

## How to use

1. Open the prompt file (e.g. `T-001.md`).
2. Copy everything between `---PROMPT START---` and `---PROMPT END---`.
3. Paste into Replit Agent input.
4. Review the agent's output against the acceptance criteria + rejection list.
5. Merge / iterate.
6. Tell the human (Claude) what was friction so the wrapper template can be refined for the next prompts.
