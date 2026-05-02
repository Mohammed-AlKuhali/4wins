import { throwApiError } from "../../lib/errors.js";

const ALLOWED_TYPES = new Set([
  "audio/m4a",
  "audio/x-m4a",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/webm",
]);

const MAX_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_DURATION_S = 60;

export function validateAudioUpload(file: File, declaredDurationS?: number) {
  if (!ALLOWED_TYPES.has(file.type) && !file.name.match(/\.(m4a|mp3|wav|webm)$/i)) {
    throwApiError(
      "VALIDATION",
      "Audio format not supported",
      422,
      { audio: "must be m4a, mp3, wav, or webm" }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    throwApiError("VALIDATION", "File too large", 413, { audio: "max 25MB" });
  }

  if (declaredDurationS !== undefined && declaredDurationS > MAX_DURATION_S) {
    throwApiError("VALIDATION", "Audio too long", 413, { audio: "max 60 seconds" });
  }
}
