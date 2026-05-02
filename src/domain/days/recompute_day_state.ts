import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { entries } from "../../db/schema/entries.js";
import { auditEvents } from "../../db/schema/audit_events.js";

const PILLARS = ["mental", "physical", "spiritual", "financial"] as const;

export async function recomputeDayState(dayId: string, userId: string) {
  const allEntries = await db
    .select({ pillar: entries.pillar })
    .from(entries)
    .where(eq(entries.dayId, dayId));

  const loggedSet = new Set(allEntries.map((e) => e.pillar));
  const pillarsLogged = PILLARS.filter((p) => loggedSet.has(p));
  const wasComplete = pillarsLogged.length === 4;

  const currentDay = await db.query.days.findFirst({ where: eq(days.id, dayId) });
  const alreadyClosed = currentDay?.closedAt !== null;

  const updates: Record<string, unknown> = { pillarsLogged };

  if (wasComplete && !alreadyClosed) {
    updates.closedAt = new Date();
    await db.insert(auditEvents).values({
      id: crypto.randomUUID(),
      userId,
      event: "day_closed",
      metadata: { day_id: dayId },
    });
  } else if (!wasComplete && alreadyClosed) {
    updates.closedAt = null;
  }

  await db.update(days).set(updates).where(eq(days.id, dayId));

  return await db.query.days.findFirst({ where: eq(days.id, dayId) });
}
