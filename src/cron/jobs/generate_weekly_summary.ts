import { eq, and, gte, lte, isNotNull, count } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { weeklySummaries } from "../../db/schema/weekly_summaries.js";
import { hasRun, markRun } from "../lib/idempotency.js";
import { getUserLocalTime } from "../lib/user_local_now.js";
import { shouldRunSundayEvening } from "../lib/should_run_at.js";
import type { User } from "../../db/schema/users.js";

function isoWeek(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function weekBounds(isoWeekStr: string): { start: string; end: string } {
  const [year, wStr] = isoWeekStr.split("-W");
  const w = parseInt(wStr, 10);
  const jan4 = new Date(Date.UTC(parseInt(year, 10), 0, 4));
  const startMs = jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * 86400000 + (w - 1) * 7 * 86400000;
  const start = new Date(startMs).toISOString().slice(0, 10);
  const end = new Date(startMs + 6 * 86400000).toISOString().slice(0, 10);
  return { start, end };
}

export async function generateWeeklySummaryJob(user: User, now: Date): Promise<void> {
  const local = getUserLocalTime(user.timezone ?? "UTC", now);
  if (!shouldRunSundayEvening(local, user.cueTimeLocal)) return;

  const week = isoWeek(local.date);
  if (await hasRun("generate_weekly_summary", user.id, week)) return;

  try {
    const { start, end } = weekBounds(week);
    const [row] = await db
      .select({ count: count() })
      .from(days)
      .where(
        and(
          eq(days.userId, user.id),
          gte(days.date, start),
          lte(days.date, end),
          isNotNull(days.closedAt)
        )
      );
    const daysComplete = row?.count ?? 0;

    await db
      .insert(weeklySummaries)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        isoWeek: week,
        daysComplete,
        pillarCounts: {},
        generatedAt: now,
      })
      .onConflictDoNothing();

    await markRun("generate_weekly_summary", user.id, week, true);
  } catch (err) {
    await markRun("generate_weekly_summary", user.id, week, false, String(err));
    throw err;
  }
}
