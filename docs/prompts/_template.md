# Phase 6 wrapper template

> The structural template every prompt file uses. Keep this in sync as we learn what works in Replit Agent.

```markdown
# Replit Agent Prompt — T-NNN — <title>

> Copy everything between the START / END markers below into Replit Agent.

---PROMPT START---

# Project: 4Wins <backend|mobile> — <ticket scope>

## What you're building

4Wins is a mobile app for a daily four-pillar discipline ritual (Physical, Mental, Spiritual, Financial). This task is for the **<backend|mobile>** of the project.

[Optional: 1-2 sentences of additional context if this ticket is unintuitive without it.]

## Stack — non-negotiable

[For backend tickets: paste the Node/Hono/Drizzle stanza from T-001.]
[For mobile tickets: paste the Expo SDK 53+ / TypeScript / react-native-svg / reanimated stanza.]

## Project conventions

[Backend: port 8787, /v1 prefix, error envelope, env loader.]
[Mobile: expo-router file-based routing, theme tokens from theme/, Text wrapper component, no Lucide.]

## Brand-bible-derived rules

[Always include the relevant subset of the rejection list §9. For backend, focus on copy/naming. For mobile, the full list.]

## PRD context

[Excerpts from PRD §X.Y that this ticket implements. Paste the relevant data model rows, API shapes, or screen specs verbatim. Don't reference PRD by section number alone — INLINE the content.]

## Your task

[Paste ticket body §What to build verbatim.]

### Files to create / modify

[Paste ticket §Files verbatim, in code-block.]

### Acceptance criteria — verify each before completing

[Paste ticket acceptance criteria as a checkbox list.]

### What NOT to do (non-goals)

[Paste ticket §Non-goals + any wrapper-level prohibitions.]

### Notes

[Paste ticket §Notes for the agent.]

### Before completing

Run through the acceptance criteria. Run through the brand rejection rules. If anything is partial, mark which criterion is unmet and explain why. Do not claim completion if tests didn't run or any criterion is unverified.

---PROMPT END---

## After running this

[Optional: ticket-specific follow-up questions for the user.]
```

## Wrapper authoring rules

1. **Inline, don't reference.** A Replit Agent prompt has no doc-tree access. If the ticket says "see brand bible §3," replace it with the actual brand-bible content.
2. **Use the project's banned-list tone in the prompt itself.** No "✨", no exclamations, no marketing voice. The prompt should embody the brand.
3. **Be explicit about what NOT to do.** Most agent failures come from helpful substitutions. List bans as red ❌ items.
4. **Pin dependencies and versions** when stack matters.
5. **Don't include the full PRD or brand bible** — only the sections this ticket touches. Token-efficient.
6. **End with a self-check** ("Before completing, verify..."). This routinely catches sloppy completions.
7. **Ask for follow-up signal** at the bottom of the prompt file (after END marker) so the human knows what to report back.

## Refinement cycle

After T-001 ships:

1. User runs T-001 prompt in Replit Agent.
2. User reports back what worked / what didn't / what was redundant.
3. We update this template + the un-authored prompts based on real friction.
4. Then T-002 onward author at ~15 min each, batched.
