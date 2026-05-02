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
  await db.insert(schema.users).values({ id, email: `sub-${id}@4wins.test`, tradition: "secular", timezone: "UTC" });
  return { id, token: await signAccessToken(id) };
}

afterAll(async () => { await client.end(); });

describe("POST /v1/subscription/start_trial", () => {
  it("starts trial for free user", async () => {
    const { id, token } = await makeUser();
    const res = await app.fetch(new Request("http://localhost/v1/subscription/start_trial", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }));
    expect(res.status).toBe(200);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });

  it("returns 409 if already on trial", async () => {
    const { id, token } = await makeUser();
    await app.fetch(new Request("http://localhost/v1/subscription/start_trial", { method: "POST", headers: { Authorization: `Bearer ${token}` } }));
    const res = await app.fetch(new Request("http://localhost/v1/subscription/start_trial", { method: "POST", headers: { Authorization: `Bearer ${token}` } }));
    expect(res.status).toBe(409);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });
});

describe("GET /v1/subscription/status", () => {
  it("returns subscription status", async () => {
    const { id, token } = await makeUser();
    const res = await app.fetch(new Request("http://localhost/v1/subscription/status", { headers: { Authorization: `Bearer ${token}` } }));
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe("free");
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });
});

describe("state machine", () => {
  it("rejects illegal transitions", async () => {
    const { assertTransition } = await import("../src/domain/subscription/state_machine.js");
    expect(() => assertTransition("paid", "trial")).toThrow();
  });

  it("allows legal transitions", async () => {
    const { assertTransition } = await import("../src/domain/subscription/state_machine.js");
    expect(() => assertTransition("free", "trial")).not.toThrow();
    expect(() => assertTransition("trial", "paid")).not.toThrow();
  });
});
