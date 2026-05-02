# Phase 6 — Replit Agent runs autonomously

> Goal: zero per-ticket pasting. The user starts a session, Agent works.

---

## How it works

The autonomous orchestration lives at the repo root in `.replit-agent-context.md`. That file tells Replit Agent:

1. Read all relevant docs (`docs/tickets/README.md`, brand bible, PRD).
2. Pick the next un-merged ticket per the dependency graph.
3. Implement it. Self-verify. Commit.
4. Move to the next ticket. Repeat.
5. Stop only when blocked or at a sprint boundary.

So the user's interaction model is:

- **Start of build:** open Replit Agent, type *anything* (even "begin"), Agent starts at T-001 and runs.
- **Sprint boundaries:** Agent posts a summary, then continues. User can interrupt to redirect.
- **Blockers:** Agent asks one focused question. User answers. Agent resumes.

That's it. No 38 commands to paste.

---

## Files in this directory

| File | Purpose |
|---|---|
| `README.md` | This explanation. |
| `_template.md` | Inlined-prompt wrapper template. **Fallback only** — used if the imported-repo workflow fails for a specific ticket and Agent needs everything pasted. Should rarely be needed. |
| `T-001.md` | A worked example of the wrapper template, kept as a safety net for the very first ticket if needed. |

The previous `commands.md` (per-ticket paste-able commands) was removed — it's now redundant since `.replit-agent-context.md` orchestrates autonomously.

---

## If autonomous mode misbehaves

| Symptom | Action |
|---|---|
| Agent doesn't read `.replit-agent-context.md` on its own | Tell it once: "Read `.replit-agent-context.md` and follow it." This is a one-time correction per session. |
| Agent stops after one ticket and waits | Tell it: "Continue the loop." Agent should resume. If the agent harness has a hard stop after each tool batch, that's a Replit limitation, not a doc problem — pin it on the user-facing summary so they know why. |
| Agent silently substitutes the stack (e.g. uses Express) | Push back: "The stack constraint is binding. Re-do the ticket with Hono." Update the context file's stack section with whatever specific framing finally lands. |
| Agent skips acceptance criteria | The context file already requires explicit walk-through. If skipped, push back. If chronic, hoist the requirement higher in `.replit-agent-context.md`. |
| Agent injects banned items (purple gradients, "✨", etc.) | Run the rejection-list grep, paste the offending lines back to Agent, ask for fix. Each occurrence is a signal that the rejection list needs to be even more prominent. |

Track friction in `docs/learnings.md` as you go — feeds back into refinements.
