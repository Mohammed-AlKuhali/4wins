import { z } from "zod";
import { throwApiError } from "../../lib/errors.js";

export const createEntrySchema = z.object({
  pillar: z.enum(["mental", "physical", "spiritual", "financial"]).optional(),
  input_method: z.enum([
    "voice",
    "type",
    "lazy_path",
    "healthkit_auto",
    "health_connect_auto",
  ]),
  raw_text: z.string().optional(),
  structured_data: z.record(z.unknown()).optional(),
  duration_seconds: z.number().int().positive().optional(),
});

export const updateEntrySchema = z
  .object({
    raw_text: z.string().optional(),
    pillar: z.enum(["mental", "physical", "spiritual", "financial"]).optional(),
  })
  .strict();

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

export function validateCreateEntry(input: CreateEntryInput) {
  const { input_method, raw_text, structured_data, pillar } = input;

  if (
    (input_method === "voice" || input_method === "type") &&
    !raw_text
  ) {
    throwApiError(
      "VALIDATION",
      `raw_text is required for input_method=${input_method}`,
      422,
      { raw_text: "required" }
    );
  }

  if (
    (input_method === "healthkit_auto" || input_method === "health_connect_auto") &&
    pillar &&
    pillar !== "physical"
  ) {
    throwApiError("VALIDATION", "healthkit_auto and health_connect_auto require pillar=physical", 422, {
      pillar: "must be physical for health auto input methods",
    });
  }

  if (pillar === "financial") {
    const sd = structured_data as Record<string, unknown> | undefined;
    if (!sd?.behavior_match || !["yes", "not_quite", "not_today"].includes(sd.behavior_match as string)) {
      throwApiError("VALIDATION", "Financial entries require structured_data.behavior_match", 422, {
        "structured_data.behavior_match": "required: yes | not_quite | not_today",
      });
    }
  }
}
