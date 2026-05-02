import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { streaks } from "../../db/schema/streaks.js";

export async function refreshMonthlyFreezes(userId: string): Promise<void> {
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const streak = await db.query.streaks.findFirst({ where: eq(streaks.userId, userId) });
  if (!streak) return;

  if (streak.monthYear === currentMonthYear) return;

  await db
    .update(streaks)
    .set({ freezesRemainingThisMonth: 2, monthYear: currentMonthYear })
    .where(eq(streaks.userId, userId));
}
