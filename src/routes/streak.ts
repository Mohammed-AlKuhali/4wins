import { Hono } from "hono";
import { eq, isNotNull, count } from "drizzle-orm";
import { db } from "../lib/db.js";
import { streaks } from "../db/schema/streaks.js";
import { days } from "../db/schema/days.js";
import { requireAuth } from "../middleware/require_auth.js";
import { recomputeStreak } from "../domain/streaks/recompute.js";
import type { AppEnv } from "../lib/app_env.js";

const streak = new Hono<AppEnv>();

streak.use("*", requireAuth);

streak.get("/", async (c) => {
  const userId = c.get("userId") as string;

  const streakRow = await recomputeStreak(userId);

  const [cumRow] = await db
    .select({ count: count() })
    .from(days)
    .where(eq(days.userId, userId));

  const cumulative = cumRow?.count ?? 0;

  return c.json({
    current: streakRow.currentCount,
    longest: streakRow.longestCount,
    freezes_remaining_this_month: streakRow.freezesRemainingThisMonth,
    freezes_used_total: streakRow.freezesUsedTotal,
    last_complete_date: streakRow.lastCompleteDate ?? null,
    cumulative_completions: cumulative,
  });
});

export default streak;
