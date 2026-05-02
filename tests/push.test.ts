import { describe, it, expect, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";
import { signAccessToken } from "../src/domain/auth/jwt.js";
import app from "../src/app.js";
import { TEMPLATES } from "../src/domain/push/templates.js";
import { resolveTemplate } from "../src/domain/push/templates.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function makeUser() {
  const id = crypto.randomUUID();
  await db.insert(schema.users).values({ id, email: `push-${id}@4wins.test`, tradition: "secular", timezone: "UTC" });
  return { id, token: await signAccessToken(id) };
}

afterAll(async () => { await client.end(); });

describe("Approved templates", () => {
  const BANNED = ["streak", "don't", "break", "last chance", "hurry"];

  it("contains no banned strings in any template body", () => {
    for (const [name, tpl] of Object.entries(TEMPLATES)) {
      for (const banned of BANNED) {
        const body = (tpl as { body: string }).body.toLowerCase();
        expect(body, `Template '${name}' contains banned string '${banned}'`).not.toContain(banned.toLowerCase());
      }
    }
  });

  it("resolves template variables", () => {
    const r = resolveTemplate("sunday_close", { days_complete: 6 });
    expect(r.body).toContain("6");
  });
});

describe("POST /v1/notifications/register", () => {
  it("registers a push token", async () => {
    const { id, token } = await makeUser();
    const res = await app.fetch(new Request("http://localhost/v1/notifications/register", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ token: `ExponentPushToken[${id}]`, platform: "ios" }),
    }));
    expect(res.status).toBe(200);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });

  it("returns 401 without auth", async () => {
    const res = await app.fetch(new Request("http://localhost/v1/notifications/register", { method: "POST" }));
    expect(res.status).toBe(401);
  });
});

describe("DELETE /v1/notifications/unregister", () => {
  it("unregisters token", async () => {
    const { id, token } = await makeUser();
    const pushToken = `ExponentPushToken[unreg-${id}]`;
    await app.fetch(new Request("http://localhost/v1/notifications/register", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ token: pushToken, platform: "android" }),
    }));
    const res = await app.fetch(new Request("http://localhost/v1/notifications/unregister", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ token: pushToken }),
    }));
    expect(res.status).toBe(200);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });
});
