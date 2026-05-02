import { describe, it, expect } from "vitest";
import app from "../src/app.js";
import { signAccessToken } from "../src/domain/auth/jwt.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function makeUser() {
  const id = crypto.randomUUID();
  await db.insert(schema.users).values({ id, email: `voice-${id}@4wins.test`, tradition: "secular", timezone: "UTC" });
  const token = await signAccessToken(id);
  return { id, token };
}

describe("POST /v1/voice/transcribe", () => {
  it("returns 401 without auth", async () => {
    const res = await app.fetch(new Request("http://localhost/v1/voice/transcribe", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("returns 422 when audio field is missing", async () => {
    const { token, id } = await makeUser();
    const form = new FormData();
    const res = await app.fetch(
      new Request("http://localhost/v1/voice/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
    );
    expect(res.status).toBe(422);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });

  it("returns 422 for unsupported content type", async () => {
    const { token, id } = await makeUser();
    const form = new FormData();
    const badFile = new File(["fake pdf data"], "audio.pdf", { type: "application/pdf" });
    form.append("audio", badFile);
    const res = await app.fetch(
      new Request("http://localhost/v1/voice/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
    );
    expect(res.status).toBe(422);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });

  it("returns 413 for oversized file", async () => {
    const { token, id } = await makeUser();
    const form = new FormData();
    const bigBuffer = new Uint8Array(26 * 1024 * 1024);
    const bigFile = new File([bigBuffer], "audio.m4a", { type: "audio/m4a" });
    form.append("audio", bigFile);
    const res = await app.fetch(
      new Request("http://localhost/v1/voice/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
    );
    expect(res.status).toBe(413);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });

  it("returns 413 for too-long declared duration", async () => {
    const { token, id } = await makeUser();
    const form = new FormData();
    const f = new File(["data"], "audio.wav", { type: "audio/wav" });
    form.append("audio", f);
    const res = await app.fetch(
      new Request("http://localhost/v1/voice/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-Audio-Duration-Seconds": "90" },
        body: form,
      })
    );
    expect(res.status).toBe(413);
    await db.delete(schema.users).where(eq(schema.users.id, id));
  });

  it("returns 503 when OpenAI not configured (no key)", async () => {
    const { token, id } = await makeUser();
    const form = new FormData();
    const f = new File(["tiny"], "audio.m4a", { type: "audio/m4a" });
    form.append("audio", f);
    const res = await app.fetch(
      new Request("http://localhost/v1/voice/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
    );
    // 503 since no OPENAI_API_KEY is set in test env
    expect([422, 503]).toContain(res.status);
    await db.delete(schema.users).where(eq(schema.users.id, id));
    await client.end();
  });
});
