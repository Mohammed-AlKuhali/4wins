import { eq, or } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";

export async function restoreSoftDeletedUser(userId: string, email: string): Promise<void> {
  await db.update(users).set({ deletedAt: null, email }).where(eq(users.id, userId));
}

export async function findSoftDeletedBySub(appleSub?: string, googleSub?: string) {
  if (!appleSub && !googleSub) return null;

  const conditions = [];
  if (appleSub) conditions.push(eq(users.appleSub, appleSub));
  if (googleSub) conditions.push(eq(users.googleSub, googleSub));

  return db.query.users.findFirst({
    where: (u) => {
      const base = conditions.length === 2 ? or(...conditions) : conditions[0];
      return base;
    },
  });
}
