import { SignJWT } from "jose";
import { db } from "../../lib/db.js";
import { users } from "../../db/schema/users.js";

export const TEST_USER_ID = "00000000-test-0000-0000-000000000001";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "test-secret-at-least-32-chars-long!!!"
);

export async function createTestJwt(): Promise<string> {
  await db
    .insert(users)
    .values({
      id: TEST_USER_ID,
      email: "test-user@4wins.test",
      tradition: "none",
      timezone: "UTC",
      subscriptionStatus: "trial",
      trialEndsAt: new Date(Date.now() + 14 * 86_400_000),
      locale: "en",
    })
    .onConflictDoNothing();

  return new SignJWT({ type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(TEST_USER_ID)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
