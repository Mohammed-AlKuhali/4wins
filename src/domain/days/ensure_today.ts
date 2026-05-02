import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { users } from "../../db/schema/users.js";
import { todayInTz } from "./date_utils.js";

export async function ensureToday(userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const tz = user?.timezone ?? "UTC";
  const dateStr = todayInTz(tz);

  const existing = await db.query.days.findFirst({
    where: and(eq(days.userId, userId), eq(days.date, dateStr)),
  });
  if (existing) return existing;

  const id = crypto.randomUUID();
  await db.execute(sql`
    INSERT INTO days (id, user_id, date)
    VALUES (${id}, ${userId}, ${dateStr})
    ON CONFLICT (user_id, date) DO NOTHING
  `);

  const day = await db.query.days.findFirst({
    where: and(eq(days.userId, userId), eq(days.date, dateStr)),
  });
  return day!;
}
