# Phase 6 — Driving Replit Agent against the imported repo

> The repo is imported into Replit. Agent has direct access to every file under `docs/`. So we drive it against the tickets directly — no wrappers, no inlining.

---

## The workflow

1. **Import the repo into Replit** (one-time).
2. **For each ticket**, paste the matching one-line command from `commands.md` into Replit Agent.
3. Agent reads the ticket file + the brand bible + the PRD, implements, and self-verifies against the acceptance criteria.
4. Review the diff. Merge if it passes. Tell me what was friction so the next ticket's command can be tighter.

That's the entire phase.

## Files

| File | Purpose |
|---|---|
| `commands.md` | One-line "paste-into-Replit-Agent" command per ticket, in dependency order. **Start here.** |
| `_template.md` | Fallback wrapper for tickets where Agent gets stuck and needs everything inlined. Rarely needed once the repo is imported. |
| `T-001.md` | The first inlined prompt (kept as a reference / safety net if `commands.md` doesn't work for some reason). |

## Why this is better than 38 wrapped prompts

- **Less duplication.** Each ticket already references the brand bible §X and PRD §Y. Imported repo means those references resolve. Wrappers were band-aids for an access problem you don't have.
- **Smaller pastes.** A one-line command vs. a 200-line wrapped prompt. Less room for accidental edits.
- **Single source of truth.** When the brand bible changes (which it will), every ticket inherits — no 38 wrappers to update.
- **The repo IS the prompt corpus.** Including this README. Including `commands.md`. Including the rejection list. Agent can grep it.

## When to fall back to a wrapper

If Agent ignores a ticket's references, fabricates context, or skips reading linked docs — fall back to `_template.md` for that one ticket. Inline what's needed. Keep going.

Once the workflow is proven, this fallback becomes vestigial.

---

## Before you start the first build

Add a `.replit-agent-context.md` (or whatever Replit Agent's preferred convention is) at the repo root that tells Agent:

> Before implementing any ticket, read:
> 1. `docs/tickets/README.md` (build conventions + dependency graph)
> 2. `docs/03-brand.md §9` (the rejection list — applies to all code)
> 3. The specific ticket file, e.g. `docs/tickets/backend/T-001-replit-setup.md`
> 4. Any `Implements PRD: §X.Y` sections referenced in the ticket header.
>
> Self-verify against the ticket's acceptance criteria before claiming completion. Run the tests.

This is the only "wrapper" that ever needs to exist — applied once at repo level, not per-prompt.

I'll write that file next if you confirm the path.
