import { Hono } from "hono";
import { requireAuth } from "../middleware/require_auth.js";
import { transcribeLimiter } from "../middleware/rate_limit.js";
import { validateAudioUpload } from "../domain/voice/validate_upload.js";
import { transcribeAudio } from "../domain/voice/transcribe.js";
import { throwApiError } from "../lib/errors.js";

const voice = new Hono();

voice.use("*", requireAuth, transcribeLimiter);

voice.post("/transcribe", async (c) => {
  let body: Record<string, unknown>;
  try {
    body = await c.req.parseBody({ all: true });
  } catch {
    throwApiError("VALIDATION", "Invalid multipart body", 422);
  }

  const audio = body!["audio"];
  if (!audio || !(audio instanceof File)) {
    throwApiError("VALIDATION", "audio field is required", 422, { audio: "required" });
  }

  const durationHeader = c.req.header("X-Audio-Duration-Seconds");
  const declaredDuration = durationHeader ? parseInt(durationHeader, 10) : undefined;

  validateAudioUpload(audio as File, declaredDuration);

  const result = await transcribeAudio(audio as File, declaredDuration);

  if (c.res.status === 503) {
    c.header("Retry-After", "5");
  }

  return c.json(result);
});

export default voice;
