import { eq } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { authSessions } from "../../db/schema/auth_sessions.js";

export async function softDeleteUser(userId: string): Promise<void> {
  const now = new Date();

  await db
    .update(authSessions)
    .set({ revokedAt: now })
    .where(eq(authSessions.userId, userId));

  await db
    .update(users)
    .set({
      deletedAt: now,
      email: `deleted-${userId}@4wins.invalid`,
      identityStatement: null,
      customTraditionText: null,
      appleSub: null,
      googleSub: null,
    })
    .where(eq(users.id, userId));
}
