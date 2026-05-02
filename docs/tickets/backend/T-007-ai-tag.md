# T-007 — AI tagging endpoint (Claude Haiku 4.5)

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-006
**Implements PRD:** §6 (POST /v1/ai/tag), §0 resolved decision #4
**Brand bible:** §3 (no "AI Coach" persona — invisible AI)

## Goal

Replace the AI-tagger stub from T-006 with a real Claude Haiku 4.5 call that classifies free-text reflections into one of the four pillars with a confidence score.

## What to build

1. `POST /v1/ai/tag` — public-shape endpoint (still requires auth) that takes text and returns `{ pillar, confidence, reasoning }`. Used by the mobile client when it wants to pre-tag before submitting.
2. The internal `tagPillar(text, options?)` function called by `POST /v1/entries` (T-006).
3. A prompt that elicits a JSON response (Anthropic structured-output via `tool_use` is the cleanest path; `response_format` not needed).
4. Multi-language support (the function doesn't care about input language; the prompt instructs the model to handle any).
5. Latency target: <500ms p95. Use `claude-haiku-4-5-20251001`. Max output tokens 200.
6. Caching: identical input within 5 min returns cached result (in-memory LRU, 1000 entries).
7. Cost guardrail: if Anthropic API errors or returns nonsense JSON, fall back to a heuristic tagger (see §Notes) — never error out the whole entry creation flow.

## Files to create / modify

```
src/domain/ai/
  tag_pillar.ts            # the real implementation
  fallback_heuristic.ts    # keyword-based fallback
  prompts/
    tag_pillar.system.md   # system prompt
    tag_pillar.user.md     # user-message template (per call: just the text)

src/routes/ai.ts           # POST /v1/ai/tag
src/lib/anthropic.ts       # SDK init, single shared client

src/app.ts                 # register route
package.json               # add @anthropic-ai/sdk

tests/ai_tag.test.ts
```

## API shape

### `POST /v1/ai/tag` body

```ts
{ text: string }
```

### Response

```ts
{
  pillar: 'mental' | 'physical' | 'spiritual' | 'financial';
  confidence: number;          // 0..1
  reasoning: string;           // one sentence, internal — never shown to user
  fallback: boolean;           // true if heuristic was used
}
```

## System prompt (`tag_pillar.system.md`)

```
You are a classifier for a daily-discipline app called 4Wins.
The app tracks four daily pillars:
- mental: learning, focus, cognitive practice, reading, study, problem-solving
- physical: movement, exercise, nutrition, sleep, body care
- spiritual: reflection, meaning, prayer, meditation, gratitude, alignment with purpose
- financial: money behavior, saving, spending decisions, earning, investing, financial mindfulness

Given a short free-text reflection (any language), return JSON:
{
  "pillar": "<one of: mental, physical, spiritual, financial>",
  "confidence": <0..1>,
  "reasoning": "<one short sentence in English>"
}

Rules:
- Choose the SINGLE best-fit pillar even if the text touches multiple.
- Confidence above 0.7 means clear single fit.
- Confidence 0.4–0.7 means plausible but ambiguous.
- Confidence below 0.4 means none fit well — pick the closest.
- Never refuse. Never add commentary outside the JSON.
- Reasoning is for internal debugging — keep it under 12 words.
```

## Acceptance criteria

- [ ] `POST /v1/ai/tag` requires auth, validates `{ text: string, length 1..2000 }`.
- [ ] Returns the response shape with `pillar` always one of the four valid strings.
- [ ] On Anthropic 5xx or timeout, falls back to heuristic and returns with `fallback: true`. No 500 to client unless DB itself fails.
- [ ] Cached: same text within 5 min returns `<10ms` from in-memory.
- [ ] `tagPillar` is callable from inside `POST /v1/entries` (T-006).
- [ ] Whisper-style multi-language input works: a Spanish-language reflection ("hoy fui a correr") classifies as `physical`.
- [ ] Tests: 8 cases covering each pillar in two languages, an ambiguous case, a clear case, an Anthropic error case (mocked).
- [ ] Prompt files are loaded from disk at boot (cached in module scope), not on every request.
- [ ] No user IDs, emails, or any other PII is sent to Anthropic — only the `text` content. Log this fact.

## Non-goals

- No multi-pillar tagging (one entry → one pillar).
- No "this isn't really a pillar win" rejection.
- No tone analysis, sentiment, or anything beyond pillar classification.
- No streaming responses.

## Notes for the agent

- Heuristic fallback (`fallback_heuristic.ts`): keyword presence per pillar (English + a small multilingual seed). Examples:
  - mental: `[learn, study, read, book, course, lesson, focus, problem]` + Spanish/Arabic seeds
  - physical: `[run, walk, gym, workout, eat, sleep, water, exercise]`
  - spiritual: `[pray, prayed, meditate, reflect, grateful, gratitude, purpose, faith]`
  - financial: `[save, saved, spend, budget, money, invest, dollar, expense]`
  - Pick max-count pillar; default to `mental` if zero matches; confidence always reported as 0.3.
- Use Anthropic `tool_use` with a single tool `classify_pillar` whose schema is the response shape — model is forced to return well-formed JSON.
- Set timeout: 3000ms. If exceeded, fallback.
- Claude model ID: `claude-haiku-4-5-20251001`.
- Set `max_tokens: 200`.
- The `reasoning` field is for our debug logs only — DO NOT return it to the mobile client. Strip before responding to the route caller. (Internal `tagPillar()` returns it; route response excludes it.)
- Consider: at scale, batch tagging multiple entries in one Anthropic call. v1 = single-text per call, v1.5 = batch.
