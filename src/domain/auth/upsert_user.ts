import { eq, or } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";
import { throwApiError } from "../../lib/errors.js";

interface UpsertParams {
  provider: "apple" | "google";
  sub: string;
  email: string | undefined;
}

export async function upsertUser(params: UpsertParams) {
  const { provider, sub, email } = params;

  if (!email) {
    throwApiError("AUTH_FAILED", "Authentication failed", 401);
  }

  const subColumn = provider === "apple" ? users.appleSub : users.googleSub;

  const existing = await db.query.users.findFirst({
    where: or(eq(subColumn, sub), eq(users.email, email!)),
  });

  if (existing) {
    const updated = await db
      .update(users)
      .set({ [provider === "apple" ? "appleSub" : "googleSub"]: sub })
      .where(eq(users.id, existing.id))
      .returning();
    return updated[0];
  }

  const id = crypto.randomUUID();
  const inserted = await db
    .insert(users)
    .values({
      id,
      email: email!,
      tradition: "secular",
      timezone: "UTC",
      [provider === "apple" ? "appleSub" : "googleSub"]: sub,
    })
    .returning();
  return inserted[0];
}
