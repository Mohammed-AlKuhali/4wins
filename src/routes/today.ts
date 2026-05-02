import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { entries } from "../db/schema/entries.js";
import { streaks } from "../db/schema/streaks.js";
import { requireAuth } from "../middleware/require_auth.js";
import { ensureToday } from "../domain/days/ensure_today.js";
import type { AppEnv } from "../lib/app_env.js";

const today = new Hono<AppEnv>();

today.use("*", requireAuth);

today.get("/", async (c) => {
  const userId = c.get("userId") as string;

  const day = await ensureToday(userId);

  const todayEntries = await db
    .select()
    .from(entries)
    .where(eq(entries.dayId, day.id));

  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });

  return c.json({
    day: {
      id: day.id,
      date: day.date,
      pillars_logged: day.pillarsLogged,
      closed_at: day.closedAt?.toISOString() ?? null,
      is_rest_day: day.isRestDay,
    },
    entries: todayEntries.map(shapeEntry),
    streak: {
      current: streak?.currentCount ?? 0,
      longest: streak?.longestCount ?? 0,
      freezes_remaining: streak?.freezesRemainingThisMonth ?? 2,
    },
  });
});

function shapeEntry(e: typeof entries.$inferSelect) {
  return {
    id: e.id,
    pillar: e.pillar,
    captured_at: e.capturedAt?.toISOString() ?? null,
    input_method: e.inputMethod,
    raw_text: e.rawText,
    ai_tagged_pillar: e.aiTaggedPillar,
    ai_confidence: e.aiConfidence,
    structured_data: e.structuredData,
    duration_seconds: e.durationSeconds,
  };
}

export { shapeEntry };
export default today;
