import { describe, it, expect, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL required for tests");

const client = postgres(connectionString);
const db = drizzle(client, { schema });

afterAll(async () => {
  await client.end();
});

describe("database roundtrip", () => {
  const userId = crypto.randomUUID();
  const dayId = crypto.randomUUID();
  const entryId = crypto.randomUUID();

  it("inserts a user", async () => {
    const [user] = await db
      .insert(schema.users)
      .values({
        id: userId,
        email: `test-${userId}@4wins.test`,
        tradition: "stoic",
        timezone: "America/New_York",
      })
      .returning();
    expect(user.id).toBe(userId);
    expect(user.email).toContain("@4wins.test");
    expect(user.subscriptionStatus).toBe("free");
  });

  it("inserts a day for that user", async () => {
    const [day] = await db
      .insert(schema.days)
      .values({
        id: dayId,
        userId,
        date: "2026-05-02",
      })
      .returning();
    expect(day.id).toBe(dayId);
    expect(day.userId).toBe(userId);
    expect(day.isRestDay).toBe(false);
  });

  it("inserts an entry on that day", async () => {
    const [entry] = await db
      .insert(schema.entries)
      .values({
        id: entryId,
        userId,
        dayId,
        pillar: "mental",
        inputMethod: "type",
        rawText: "Read two chapters of a difficult book.",
      })
      .returning();
    expect(entry.id).toBe(entryId);
    expect(entry.pillar).toBe("mental");
  });

  it("queries the day with its entries", async () => {
    const day = await db.query.days.findFirst({
      where: eq(schema.days.id, dayId),
      with: { entries: true } as Record<string, unknown>,
    });
    expect(day).toBeDefined();
    expect((day as { entries?: unknown[] }).entries).toBeDefined();
  });

  it("cascade deletes days and entries when user is deleted", async () => {
    await db.delete(schema.users).where(eq(schema.users.id, userId));

    const days = await db
      .select()
      .from(schema.days)
      .where(eq(schema.days.userId, userId));
    expect(days).toHaveLength(0);

    const entries = await db
      .select()
      .from(schema.entries)
      .where(eq(schema.entries.userId, userId));
    expect(entries).toHaveLength(0);
  });
});
