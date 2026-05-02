# T-008 — Voice transcription endpoint (Whisper)

**Area:** backend
**Estimate:** 60 min
**Depends on:** T-006
**Implements PRD:** §6 (POST /v1/voice/transcribe), §0 resolved decision #3
**Brand bible:** §3 (Maya / Ahmad — multi-language)

## Goal

Implement the `POST /v1/voice/transcribe` endpoint. Mobile client uploads audio (m4a/mp3/wav), server forwards to OpenAI Whisper, returns transcript + detected language. Used by the voice-capture overlay (T-034) before pillar tagging.

## What to build

1. `POST /v1/voice/transcribe` — multipart upload, max 25MB (Whisper hard limit), max 60s audio (we enforce client-side and server-side). Returns transcript text + detected language code.
2. OpenAI client init in `src/lib/openai.ts`.
3. Validation: file required, content-type whitelist, size limit, audio duration peek (use `ffprobe` if available, else trust client-supplied `duration_seconds` header).
4. Rate limit: 30/min/user (already configured in T-004).
5. Error handling: provider 5xx → 503 with retry hint, file too large → 413, no audio detected → `VALIDATION` with `fields.audio: 'no_speech'`.
6. Privacy: audio is NEVER stored. Stream-pass-through to OpenAI. After response, audio buffer discarded (TS — no explicit free needed; just ensure we don't write to disk or DB).
7. Tests: small audio fixture, oversized rejection, content-type rejection, language-detection sanity.

## Files to create / modify

```
src/routes/voice.ts                  # POST /v1/voice/transcribe
src/domain/voice/
  transcribe.ts                      # OpenAI Whisper call
  validate_upload.ts                 # zod + content-type checks
src/lib/openai.ts                    # OpenAI SDK init

src/app.ts                           # register route
package.json                         # add openai

tests/voice.test.ts
tests/fixtures/short_clip.m4a        # 2-3 second sample
```

## API shape

### `POST /v1/voice/transcribe`

Multipart form:
- field `audio` (binary, required, content-type `audio/m4a` | `audio/mpeg` | `audio/wav` | `audio/webm`)
- header `X-Audio-Duration-Seconds` (int, optional but recommended)

### Response

```ts
{
  text: string;
  language: string;          // BCP 47 code, e.g. 'en', 'ar', 'es'
  duration_seconds: number;  // server-computed if possible, else echoed from header
  confidence: number | null; // Whisper doesn't always return; null if unavailable
}
```

## Acceptance criteria

- [ ] `POST /v1/voice/transcribe` requires auth.
- [ ] Accepts m4a, mpeg, wav, webm audio. Rejects others with `VALIDATION`.
- [ ] Files > 25MB → 413 with `error.code='FILE_TOO_LARGE'`.
- [ ] Files > 60s declared duration → 413 (same code).
- [ ] Empty / silent audio → 400 with `fields.audio: 'no_speech'`.
- [ ] Returns transcript + language code.
- [ ] Multi-language: an Arabic clip returns `language: 'ar'` and Arabic-script text.
- [ ] On Whisper 5xx, returns 503 with `Retry-After: 5`.
- [ ] On Whisper timeout (>15s), returns 503.
- [ ] Audio buffer is NOT persisted anywhere (verify: tests assert no disk writes, no DB rows).
- [ ] Rate-limit: 31st request from same user in a minute → 429.
- [ ] Tests: 5 cases.
- [ ] No PII sent to OpenAI besides the audio itself (no headers with user info).

## Non-goals

- No on-device transcription (v1.5 perf optimization per PRD).
- No translation (Whisper supports it but we want native-language transcript).
- No diarization (single speaker assumed).
- No audio storage (privacy decision is firm).
- No transcript correction UI in this ticket (T-034 owns that surface).

## Notes for the agent

- Use OpenAI's `audio.transcriptions.create` with model `whisper-1`. Set `response_format: 'verbose_json'` to get language + segments.
- Don't use form-data parsing libraries — Hono has built-in `c.req.parseBody({ all: true })`.
- Stream the file to OpenAI: get the file as a `File` (browser-style), pass directly to `client.audio.transcriptions.create({ file, model })`.
- Client-side mobile capture (T-034): record m4a (iOS) or webm (Android), aim for 16kHz mono — keeps file small.
- Audio duration: if `X-Audio-Duration-Seconds` header missing, accept the request but log it. Don't try to install ffprobe just for this.
- Add `prompt` parameter to Whisper call: `"daily reflection on physical, mental, spiritual, or financial pillar"`. Helps Whisper choose pillar-related vocabulary.
- Logging: log only `{ user_id, duration_seconds, language, ms }` — never the transcript.
- The `text` returned by Whisper sometimes includes leading/trailing whitespace — trim before returning.
