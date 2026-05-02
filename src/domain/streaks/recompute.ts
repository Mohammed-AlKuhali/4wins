import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { streaks } from "../../db/schema/streaks.js";

export async function recomputeStreak(userId: string) {
  const existing = await db.query.streaks.findFirst({
    where: eq(streaks.userId, userId),
  });
  if (existing) return existing;

  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [created] = await db
    .insert(streaks)
    .values({ userId, monthYear })
    .onConflictDoNothing()
    .returning();
  return (
    created ??
    (await db.query.streaks.findFirst({ where: eq(streaks.userId, userId) }))!
  );
}
