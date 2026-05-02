# T-034 — Voice capture overlay

**Area:** mobile
**Estimate:** 90 min
**Depends on:** T-031, T-008
**Implements PRD:** §3 screen 14, §4 spec
**Brand bible:** §7 (motion), §8 (full-bleed)

## Goal

The voice-first capture modal that's the primary input for Mental, Spiritual, and Financial-why entries. Records audio, uploads to `/v1/voice/transcribe`, shows live transcript, and returns the result to the calling pillar capture screen.

## What to build

1. **Modal route** at `(modals)/voice.tsx`, presented via `presentation: 'modal'`.
2. **Recording state:** large red Stop button, animated waveform (audio-level pulse), live transcript appearing below as Whisper streams (note: Whisper isn't streaming; we show a "processing…" state instead — see notes).
3. **Stop → upload:** convert recording to m4a (iOS) / webm (Android), POST to `/v1/voice/transcribe`, get text + language back.
4. **Review state:** transcript shown in full with [Save] and [Re-record].
5. **AI tag preview:** before save, optionally call `POST /v1/ai/tag` to preview the suggested pillar — show as a subtle line "This sounds like a [pillar] win." User can dismiss or accept.
6. **Save:** POST to `/v1/entries` with `input_method=voice`, `raw_text=transcript`, return the modal with the result to the pillar capture screen.
7. **Permissions:** request microphone on first use; if denied, show a clear note and dismiss.

## Files to create / modify

```
apps/mobile/app/(modals)/voice.tsx
apps/mobile/components/voice/
  VoiceRecorder.tsx
  Waveform.tsx
  TranscriptReview.tsx
  PillarTagPreview.tsx
apps/mobile/lib/audio_recorder.ts                    # expo-av wrapper
apps/mobile/__tests__/voice.test.tsx
```

## Acceptance criteria

- [ ] Tapping the mic button on any pillar capture screen opens the voice modal.
- [ ] Microphone permission requested on first use; "denied" path shows brand-voice note and dismisses.
- [ ] Recording UI: animated waveform reacts to audio levels; large red Stop button bottom-center.
- [ ] Stop triggers upload; "Processing…" state shown during the (~2s) round-trip.
- [ ] Transcript displayed in full with [Save] [Re-record] [Cancel].
- [ ] [Save] posts entry with `input_method=voice` and the right pillar; modal dismisses; pillar capture screen pops back to home; home animates the new arc.
- [ ] On Whisper failure ("no_speech" or 5xx), show "We didn't catch that. Try again, or type." per brand §3 verbatim.
- [ ] Pillar tag preview surfaces only if confidence ≥ 0.7 AND suggested pillar ≠ current pillar.
- [ ] Max recording length 60s; recording auto-stops at 60s with a soft haptic.
- [ ] Tests: permission denied, happy path, transcription failure, mismatch suggestion accept, max-duration auto-stop.

## Non-goals

- No on-device transcription (T-021 PRD decision).
- No transcript editing in the review state — re-record only.
- No background recording.
- No saving raw audio anywhere — privacy.

## Notes for the agent

- Use `expo-av` `Audio.Recording`. iOS: m4a, 16kHz mono, AAC. Android: webm or m4a, same target.
- Live waveform: use `setOnRecordingStatusUpdate` to get metering values; animate a `<Bar>` strip via Reanimated.
- Whisper is not streaming — show a "Processing…" pulse during the upload+transcribe round-trip. Cap timeout at 15s; on timeout, fall back to "Try again, or type."
- The pillar tag preview is a small caption line below the transcript: "This sounds like a [pillar] win." with a tap-to-switch action that updates the target pillar before save.
- Use `expo-haptics` for: start recording (light tap), max-duration auto-stop (medium), save success (light double-tap).
- Test on both iOS and Android — recording quirks differ.
