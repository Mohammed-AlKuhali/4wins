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
    email: `entries-test-${userId}@4wins.test`,
    tradition: "stoic",
    timezone: "UTC",
  });
  token = await signAccessToken(userId);
  // ensure today exists
  await app.fetch(new Request("http://localhost/v1/today", { headers: { Authorization: `Bearer ${token}` } }));
});

afterAll(async () => {
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await client.end();
});

async function post(body: object, key?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (key) headers["Idempotency-Key"] = key;
  return app.fetch(new Request("http://localhost/v1/entries", { method: "POST", headers, body: JSON.stringify(body) }));
}

describe("POST /v1/entries", () => {
  it("creates entry with explicit pillar", async () => {
    const res = await post({ pillar: "mental", input_method: "type", raw_text: "Read a chapter." });
    expect(res.status).toBe(201);
    const body = await res.json() as { entry: { pillar: string }; day: { pillars_logged: string[] } };
    expect(body.entry.pillar).toBe("mental");
    expect(body.day.pillars_logged).toContain("mental");
  });

  it("creates entry without pillar (uses AI stub)", async () => {
    const res = await post({ input_method: "type", raw_text: "Something random." });
    expect(res.status).toBe(201);
    const body = await res.json() as { entry: { pillar: string }; ai_tag: unknown };
    expect(body.entry.pillar).toBe("mental");
    expect(body.ai_tag).toBeDefined();
  });

  it("closes day when 4th distinct pillar logged", async () => {
    await post({ pillar: "physical", input_method: "lazy_path" });
    await post({ pillar: "spiritual", input_method: "lazy_path" });
    const res = await post({
      pillar: "financial",
      input_method: "type",
      raw_text: "Checked my savings.",
      structured_data: { behavior_match: "yes" },
    });
    const body = await res.json() as { day: { closed_at: string | null; pillars_logged: string[] } };
    expect(body.day.closed_at).not.toBeNull();
    expect(body.day.pillars_logged).toHaveLength(4);
  });

  it("requires raw_text for voice/type input_method", async () => {
    const res = await post({ pillar: "mental", input_method: "voice" });
    expect(res.status).toBe(422);
  });

  it("requires structured_data.behavior_match for financial", async () => {
    const res = await post({ pillar: "financial", input_method: "type", raw_text: "hi" });
    expect(res.status).toBe(422);
  });

  it("returns cached response for same idempotency key", async () => {
    const key = `idem-${crypto.randomUUID()}`;
    const r1 = await post({ pillar: "mental", input_method: "lazy_path" }, key);
    const r2 = await post({ pillar: "mental", input_method: "lazy_path" }, key);
    const b1 = await r1.json() as { entry: { id: string } };
    const b2 = await r2.json() as { entry: { id: string } };
    expect(b1.entry.id).toBe(b2.entry.id);
  });
});

describe("PATCH /v1/entries/:id", () => {
  it("updates pillar and recomputes day state", async () => {
    const createRes = await post({ pillar: "mental", input_method: "type", raw_text: "test" });
    const created = await createRes.json() as { entry: { id: string }; day: { pillars_logged: string[] } };
    const entryId = created.entry.id;

    const res = await app.fetch(
      new Request(`http://localhost/v1/entries/${entryId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pillar: "spiritual" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { entry: { pillar: string }; day: { pillars_logged: string[] } };
    expect(body.entry.pillar).toBe("spiritual");
  });
});

describe("DELETE /v1/entries/:id", () => {
  it("removes entry and recalculates day state", async () => {
    const userId2 = crypto.randomUUID();
    await db.insert(schema.users).values({
      id: userId2,
      email: `del-entry-${userId2}@4wins.test`,
      tradition: "secular",
      timezone: "UTC",
    });
    const t2 = await signAccessToken(userId2);
    await app.fetch(new Request("http://localhost/v1/today", { headers: { Authorization: `Bearer ${t2}` } }));

    const createRes = await app.fetch(
      new Request("http://localhost/v1/entries", {
        method: "POST",
        headers: { Authorization: `Bearer ${t2}`, "Content-Type": "application/json" },
        body: JSON.stringify({ pillar: "mental", input_method: "type", raw_text: "hello" }),
      })
    );
    const created = await createRes.json() as { entry: { id: string } };

    const delRes = await app.fetch(
      new Request(`http://localhost/v1/entries/${created.entry.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${t2}` },
      })
    );
    expect(delRes.status).toBe(200);
    const delBody = await delRes.json() as { day: { pillars_logged: string[] } };
    expect(delBody.day.pillars_logged).not.toContain("mental");

    await db.delete(schema.users).where(eq(schema.users.id, userId2));
  });
});
