import { eq, isNull } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { auditEvents } from "../../db/schema/audit_events.js";

export async function hardDeleteUser(userId: string): Promise<void> {
  // Anonymize audit events first
  await db.execute(
    // @ts-ignore — raw SQL for update with null
    (await import("drizzle-orm")).sql`UPDATE audit_events SET user_id = NULL WHERE user_id = ${userId}`
  );

  // Cascade delete handles all child tables
  await db.delete(users).where(eq(users.id, userId));
}

export async function hardDeleteLapsedAccounts(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 86400000);
  const lapsed = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.deletedAt, cutoff)); // handled below

  // Use raw SQL to find users where deletedAt < cutoff
  const { sql } = await import("drizzle-orm");
  const rows = await db.execute(
    sql`SELECT id FROM users WHERE deleted_at IS NOT NULL AND deleted_at < ${cutoff.toISOString()}`
  );

  let deleted = 0;
  for (const row of rows as { id: string }[]) {
    await hardDeleteUser(row.id);
    deleted++;
  }
  return deleted;
}
