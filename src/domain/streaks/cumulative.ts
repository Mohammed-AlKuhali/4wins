import { eq, isNotNull, count } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";

export async function getCumulativeCompletions(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(days)
    .where(eq(days.userId, userId) && isNotNull(days.closedAt));
  return row?.count ?? 0;
}
