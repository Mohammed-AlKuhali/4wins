import { describe, it, expect, beforeAll } from "vitest";
import { createTestJwt } from "./helpers/auth.js";

const BASE = "http://localhost:8080";

const INTEGRATION = process.env.INTEGRATION === "1";

describe.skipIf(!INTEGRATION)("POST /v1/audit (integration)", () => {
  let token: string;

  beforeAll(async () => {
    token = await createTestJwt();
  });

  it("rejects without auth", async () => {
    const res = await fetch(`${BASE}/v1/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "screen_view", metadata: { screen: "home" } }),
    });
    expect(res.status).toBe(401);
  });

  it("accepts valid event with allowed keys", async () => {
    const res = await fetch(`${BASE}/v1/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_type: "screen_view",
        metadata: { screen: "home", locale: "en" },
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it("rejects banned metadata key", async () => {
    const res = await fetch(`${BASE}/v1/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_type: "screen_view",
        metadata: { email: "user@example.com" },
      }),
    });
    expect(res.status).toBe(422);
  });

  it("rejects unknown metadata key", async () => {
    const res = await fetch(`${BASE}/v1/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_type: "entry_created",
        metadata: { raw_text: "I worked out today" },
      }),
    });
    expect(res.status).toBe(422);
  });

  it("rejects empty event_type", async () => {
    const res = await fetch(`${BASE}/v1/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event_type: "" }),
    });
    expect(res.status).toBe(422);
  });
});
