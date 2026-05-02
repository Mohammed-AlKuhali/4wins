import { openai } from "../../lib/openai.js";
import { throwApiError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

export interface TranscribeResult {
  text: string;
  language: string;
  duration_seconds: number | null;
  confidence: number | null;
}

export async function transcribeAudio(
  file: File,
  declaredDurationS?: number
): Promise<TranscribeResult> {
  if (!openai) {
    throwApiError("VALIDATION", "Voice transcription is not configured", 503);
  }

  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), 15000);

    const response = await openai!.audio.transcriptions.create(
      {
        file,
        model: "whisper-1",
        response_format: "verbose_json",
        prompt: "daily reflection on physical, mental, spiritual, or financial pillar",
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutHandle);

    const text = (response.text ?? "").trim();

    if (!text || text.length === 0) {
      throwApiError("VALIDATION", "No speech detected", 400, { audio: "no_speech" });
    }

    const ms = Date.now() - start;
    logger.info({
      duration_seconds: declaredDurationS,
      language: response.language,
      ms,
    }, "Transcription complete (no user PII logged)");

    return {
      text,
      language: response.language ?? "en",
      duration_seconds: declaredDurationS ?? null,
      confidence: null,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.constructor.name === "ApiError") throw err;

    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort") || msg.includes("timeout")) {
      throwApiError("SERVER_ERROR", "Transcription timed out. Try again shortly.", 503);
    }

    logger.error({ err: msg }, "Whisper error");
    throwApiError("SERVER_ERROR", "Transcription service unavailable. Try again shortly.", 503);
  }
}
