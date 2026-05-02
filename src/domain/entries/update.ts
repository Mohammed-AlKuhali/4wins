import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { entries } from "../../db/schema/entries.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { recomputeDayState } from "../days/recompute_day_state.js";
import { throwApiError } from "../../lib/errors.js";
import type { UpdateEntryInput } from "./validate.js";

export async function updateEntry(
  entryId: string,
  userId: string,
  input: UpdateEntryInput
) {
  const existing = await db.query.entries.findFirst({
    where: eq(entries.id, entryId),
  });
  if (!existing || existing.userId !== userId) {
    throwApiError("NOT_FOUND", "Entry not found", 404);
  }

  const updates: Record<string, unknown> = {};
  if (input.raw_text !== undefined) updates.rawText = input.raw_text;
  if (input.pillar !== undefined) updates.pillar = input.pillar;

  const [updated] = await db
    .update(entries)
    .set(updates)
    .where(eq(entries.id, entryId))
    .returning();

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "entry_updated",
    metadata: { entry_id: entryId, fields: Object.keys(input) },
  });

  const day = await recomputeDayState(existing!.dayId, userId);
  return { entry: updated, day: day! };
}
