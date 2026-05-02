import { eq, desc, and, isNotNull } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { streaks } from "../../db/schema/streaks.js";
import { days } from "../../db/schema/days.js";
import { todayInTz } from "../days/date_utils.js";
import { users } from "../../db/schema/users.js";

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(date: string, n: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return yyyymmdd(d);
}

function diffDays(a: string, b: string): number {
  return (new Date(a + "T00:00:00Z").getTime() - new Date(b + "T00:00:00Z").getTime()) / 86400000;
}

export async function recomputeStreak(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const tz = user?.timezone ?? "UTC";
  const todayStr = todayInTz(tz);

  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let streak = await db.query.streaks.findFirst({ where: eq(streaks.userId, userId) });
  if (!streak) {
    const [created] = await db
      .insert(streaks)
      .values({ userId, monthYear })
      .returning();
    streak = created;
  }

  // Fetch last 40 days
  const recentDays = await db
    .select()
    .from(days)
    .where(eq(days.userId, userId))
    .orderBy(desc(days.date))
    .limit(40);

  if (recentDays.length === 0) {
    return streak!;
  }

  const dayMap = new Map(recentDays.map((d) => [d.date, d]));

  // Walk backwards from today to count current streak
  // Day 2 rule: find the first complete day (the "Day 1"), then count from Day 2 onward
  let currentCount = 0;
  let longestCount = streak!.longestCount;
  let lastCompleteDate: string | null = null;
  let foundFirstComplete = false;
  let streakBroken = false;

  // Find streak start by walking back
  let cursor = todayStr;

  // We walk back up to 40 days
  for (let i = 0; i < 40; i++) {
    const checkDate = addDays(cursor, -i);
    const day = dayMap.get(checkDate);

    if (!day) {
      // No row for this date — if it's in the past (not today), treat as missed
      if (checkDate < todayStr) {
        streakBroken = true;
        break;
      }
      continue;
    }

    if (day.isRestDay) continue;

    if (day.closedAt !== null) {
      if (!foundFirstComplete) {
        foundFirstComplete = true;
        lastCompleteDate = checkDate;
        // Day 1 doesn't count toward streak — continue to Day 2+
        continue;
      }
      // This is Day 2+ — counts toward streak
      currentCount++;
      if (currentCount > longestCount) longestCount = currentCount;
    } else {
      // Missed day (no close, not rest)
      if (foundFirstComplete) {
        streakBroken = true;
        break;
      }
    }
  }

  if (!foundFirstComplete) {
    currentCount = 0;
    lastCompleteDate = null;
  }

  const updated = await db
    .update(streaks)
    .set({
      currentCount,
      longestCount,
      lastCompleteDate,
      monthYear,
    })
    .where(eq(streaks.userId, userId))
    .returning();

  return updated[0] ?? streak!;
}
