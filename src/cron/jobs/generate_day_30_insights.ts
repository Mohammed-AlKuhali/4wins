import { eq, and, isNotNull, count } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { insights } from "../../db/schema/insights.js";
import { generateDay30Insights } from "../../domain/insights/generate.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import type { User } from "../../db/schema/users.js";

export async function generateDay30InsightsJob(user: User, now: Date): Promise<void> {
  const local = getUserLocalTime(user.timezone ?? "UTC", now);

  // Already generated?
  if (await hasRun("generate_day_30_insights", user.id, "once")) return;

  // Check if user has 30 closed days
  const [row] = await db
    .select({ count: count() })
    .from(days)
    .where(and(eq(days.userId, user.id), isNotNull(days.closedAt)));

  if ((row?.count ?? 0) < 30) return;

  try {
    await generateDay30Insights(user.id);
    await markRun("generate_day_30_insights", user.id, "once", true);
  } catch (err) {
    await markRun("generate_day_30_insights", user.id, "once", false, String(err));
    throw err;
  }
}
