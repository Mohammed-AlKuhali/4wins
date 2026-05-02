import { eq, and, gte, lte, isNotNull, count } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { pushQueue } from "../../db/schema/push_queue.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import { shouldRunSundayEvening } from "../lib/should_run_at.js";
import type { User } from "../../db/schema/users.js";

export async function sendEveningCuePushJob(user: User, now: Date): Promise<void> {
  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (!shouldRunSundayEvening(local, user.cueTimeLocal)) return;

  if (await hasRun("send_evening_cue_push", user.id, local.date)) return;

  try {
    // Count this week's complete days (Mon-Sun)
    const weekStart = new Date(now);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = local.date;

    const [row] = await db
      .select({ count: count() })
      .from(days)
      .where(and(eq(days.userId, user.id), gte(days.date, weekStartStr), lte(days.date, weekEndStr), isNotNull(days.closedAt)));

    const daysComplete = row?.count ?? 0;

    await db.insert(pushQueue).values({
      id: crypto.randomUUID(),
      userId: user.id,
      template: "sunday_close",
      payload: { days_complete: daysComplete },
      scheduledFor: now,
    }).onConflictDoNothing();

    await markRun("send_evening_cue_push", user.id, local.date, true);
  } catch (err) {
    await markRun("send_evening_cue_push", user.id, local.date, false, String(err));
    throw err;
  }
}
