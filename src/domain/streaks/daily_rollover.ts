import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { streaks } from "../../db/schema/streaks.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { users } from "../../db/schema/users.js";
import { todayInTz } from "../days/date_utils.js";
import { recomputeStreak } from "./recompute.js";

function yesterdayInTz(timezone: string): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const dv = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${dv}`;
}

export async function applyDailyRollover(userId: string): Promise<void> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || user.deletedAt) return;

  const tz = user.timezone ?? "UTC";
  const yesterday = yesterdayInTz(tz);

  const yesterdayRow = await db.query.days.findFirst({
    where: and(eq(days.userId, userId), eq(days.date, yesterday)),
  });

  if (!yesterdayRow) return;
  if (yesterdayRow.isRestDay) return;
  if (yesterdayRow.closedAt !== null) return;

  const streak = await db.query.streaks.findFirst({ where: eq(streaks.userId, userId) });
  if (!streak) return;

  if (streak.freezesRemainingThisMonth > 0) {
    await db
      .update(days)
      .set({ isRestDay: true })
      .where(and(eq(days.userId, userId), eq(days.date, yesterday)));

    await db
      .update(streaks)
      .set({ freezesRemainingThisMonth: streak.freezesRemainingThisMonth - 1, freezesUsedTotal: streak.freezesUsedTotal + 1 })
      .where(eq(streaks.userId, userId));

    await db.insert(auditEvents).values({
      id: crypto.randomUUID(),
      userId,
      event: "rest_day_applied",
      metadata: { date: yesterday, freeze_used: true },
    });

    await recomputeStreak(userId);
  }
  // else: streak resets naturally on next recomputeStreak call
}
