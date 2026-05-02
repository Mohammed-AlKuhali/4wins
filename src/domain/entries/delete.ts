import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { entries } from "../../db/schema/entries.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { recomputeDayState } from "../days/recompute_day_state.js";
import { recomputeStreak } from "../streaks/recompute.js";
import { throwApiError } from "../../lib/errors.js";

export async function deleteEntry(entryId: string, userId: string) {
  const existing = await db.query.entries.findFirst({
    where: eq(entries.id, entryId),
  });
  if (!existing || existing.userId !== userId) {
    throwApiError("NOT_FOUND", "Entry not found", 404);
  }

  const dayId = existing!.dayId;
  await db.delete(entries).where(eq(entries.id, entryId));

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "entry_deleted",
    metadata: { entry_id: entryId, pillar: existing!.pillar },
  });

  const day = await recomputeDayState(dayId, userId);
  const streak = await recomputeStreak(userId);
  return { day: day!, streak };
}
