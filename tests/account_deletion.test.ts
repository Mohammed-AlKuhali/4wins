import { describe, it, expect, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";
import { signAccessToken } from "../src/domain/auth/jwt.js";
import app from "../src/app.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function makeUser() {
  const id = crypto.randomUUID();
  await db.insert(schema.users).values({ id, email: `del-${id}@4wins.test`, tradition: "secular", timezone: "UTC" });
  return { id, token: await signAccessToken(id) };
}

afterAll(async () => { await client.end(); });

describe("DELETE /v1/me (soft delete)", () => {
  it("soft-deletes the user", async () => {
    const { id, token } = await makeUser();
    const res = await app.fetch(new Request("http://localhost/v1/me", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }));
    expect(res.status).toBe(204);
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
    expect(user?.deletedAt).not.toBeNull();
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });
});

describe("DELETE /v1/me?immediate=true (hard delete)", () => {
  it("immediately removes all user data", async () => {
    const { id, token } = await makeUser();
    const res = await app.fetch(new Request("http://localhost/v1/me?immediate=true", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }));
    expect(res.status).toBe(204);
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
    expect(user).toBeUndefined();
  });
});

describe("hardDeleteLapsedAccounts", () => {
  it("hard-deletes users where deleted_at is past 30-day cutoff", async () => {
    const id = crypto.randomUUID();
    const pastDate = new Date(Date.now() - 31 * 86400000);
    await db.insert(schema.users).values({
      id,
      email: `lapsed-${id}@4wins.test`,
      tradition: "secular",
      timezone: "UTC",
      deletedAt: pastDate,
    });
    const { hardDeleteLapsedAccounts } = await import("../src/domain/users/hard_delete.js");
    const count = await hardDeleteLapsedAccounts();
    expect(count).toBeGreaterThanOrEqual(1);
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) });
    expect(user).toBeUndefined();
  });
});

describe("insights endpoint", () => {
  it("returns empty insights for new user", async () => {
    const { id, token } = await makeUser();
    const res = await app.fetch(new Request("http://localhost/v1/insights", { headers: { Authorization: `Bearer ${token}` } }));
    expect(res.status).toBe(200);
    const body = await res.json() as { insights: unknown[] };
    expect(Array.isArray(body.insights)).toBe(true);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });
});
