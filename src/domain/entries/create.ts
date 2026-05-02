import { db } from "../../lib/db.js";
import { entries } from "../../db/schema/entries.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { tagPillar } from "../ai/tag_pillar.js";
import { recomputeDayState } from "../days/recompute_day_state.js";
import { recomputeStreak } from "../streaks/recompute.js";
import type { CreateEntryInput } from "./validate.js";

export async function createEntry(
  userId: string,
  dayId: string,
  input: CreateEntryInput
) {
  let pillar = input.pillar;
  let aiTag: { pillar: string; confidence: number; reasoning: string } | undefined;
  let mismatchHint: { current: string; suggested: string } | undefined;

  if (!pillar) {
    const tag = await tagPillar(input.raw_text ?? "");
    pillar = tag.pillar;
    aiTag = tag;
  } else if (input.raw_text) {
    const tag = await tagPillar(input.raw_text);
    if (tag.pillar !== pillar && tag.confidence >= 0.7) {
      mismatchHint = { current: pillar, suggested: tag.pillar };
    }
  }

  const rawText =
    input.input_method === "lazy_path" ? null : (input.raw_text ?? null);

  const id = crypto.randomUUID();
  const [entry] = await db
    .insert(entries)
    .values({
      id,
      userId,
      dayId,
      pillar,
      inputMethod: input.input_method,
      rawText,
      structuredData: input.structured_data ?? null,
      durationSeconds: input.duration_seconds ?? null,
    })
    .returning();

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "entry_created",
    metadata: { entry_id: id, pillar, input_method: input.input_method },
  });

  const day = await recomputeDayState(dayId, userId);
  const streak = await recomputeStreak(userId);

  return { entry, day: day!, streak, aiTag, mismatchHint };
}
