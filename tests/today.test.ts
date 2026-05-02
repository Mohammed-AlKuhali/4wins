import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";
import { signAccessToken } from "../src/domain/auth/jwt.js";
import app from "../src/app.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

let userId: string;
let token: string;

beforeAll(async () => {
  userId = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: userId,
    email: `today-test-${userId}@4wins.test`,
    tradition: "stoic",
    timezone: "America/New_York",
  });
  token = await signAccessToken(userId);
});

afterAll(async () => {
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await client.end();
});

describe("GET /v1/today", () => {
  it("creates day lazily and returns it", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/today", {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { day: { id: string; pillars_logged: string[] }; entries: unknown[]; streak: { current: number } };
    expect(body.day).toBeDefined();
    expect(body.day.pillars_logged).toEqual([]);
    expect(body.entries).toEqual([]);
    expect(body.streak.current).toBe(0);
  });

  it("does not create duplicate rows on concurrent calls", async () => {
    const [r1, r2] = await Promise.all([
      app.fetch(new Request("http://localhost/v1/today", { headers: { Authorization: `Bearer ${token}` } })),
      app.fetch(new Request("http://localhost/v1/today", { headers: { Authorization: `Bearer ${token}` } })),
    ]);
    const b1 = await r1.json() as { day: { id: string } };
    const b2 = await r2.json() as { day: { id: string } };
    expect(b1.day.id).toBe(b2.day.id);
  });
});
