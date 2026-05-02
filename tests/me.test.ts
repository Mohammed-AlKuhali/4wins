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
    email: `me-test-${userId}@4wins.test`,
    tradition: "stoic",
    timezone: "America/New_York",
  });
  token = await signAccessToken(userId);
});

afterAll(async () => {
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await client.end();
});

describe("GET /v1/me", () => {
  it("returns user shape with required fields", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe(userId);
    expect(body.email).toContain("@4wins.test");
    expect(body.tradition).toBe("stoic");
    expect(body.subscription_status).toBe("free");
    expect(body).not.toHaveProperty("apple_sub");
    expect(body).not.toHaveProperty("google_sub");
    expect(body).not.toHaveProperty("deleted_at");
  });

  it("returns 401 without auth", async () => {
    const res = await app.fetch(new Request("http://localhost/v1/me"));
    expect(res.status).toBe(401);
  });
});

describe("PATCH /v1/me", () => {
  it("updates allowed fields", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tradition: "buddhist",
          cue_time_of_day: "morning",
          timezone: "Europe/London",
        }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.tradition).toBe("buddhist");
    expect(body.cue_time_of_day).toBe("morning");
    expect(body.cue_time_local).toBe("07:30:00");
    expect(body.timezone).toBe("Europe/London");
  });

  it("rejects server-managed fields", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "hacked@evil.com" }),
      })
    );
    expect(res.status).toBe(422);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("VALIDATION");
  });

  it("rejects invalid timezone", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timezone: "Not/A/Timezone" }),
      })
    );
    expect(res.status).toBe(422);
  });

  it("clears custom_tradition_text when switching away from custom", async () => {
    await app.fetch(
      new Request("http://localhost/v1/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tradition: "custom", custom_tradition_text: "My way" }),
      })
    );
    const res = await app.fetch(
      new Request("http://localhost/v1/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tradition: "stoic" }),
      })
    );
    const body = await res.json() as Record<string, unknown>;
    expect(body.custom_tradition_text).toBeNull();
  });
});

describe("DELETE /v1/me", () => {
  it("soft-deletes user and returns 204", async () => {
    const deleteUserId = crypto.randomUUID();
    await db.insert(schema.users).values({
      id: deleteUserId,
      email: `del-${deleteUserId}@4wins.test`,
      tradition: "secular",
      timezone: "UTC",
    });
    const deleteToken = await signAccessToken(deleteUserId);

    const res = await app.fetch(
      new Request("http://localhost/v1/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${deleteToken}` },
      })
    );
    expect(res.status).toBe(204);

    const meRes = await app.fetch(
      new Request("http://localhost/v1/me", {
        headers: { Authorization: `Bearer ${deleteToken}` },
      })
    );
    expect(meRes.status).toBe(401);

    await db.delete(schema.users).where(eq(schema.users.id, deleteUserId));
  });
});
