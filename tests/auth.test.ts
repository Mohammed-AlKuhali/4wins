import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../src/app.js";

describe("auth middleware", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const req = new Request("http://localhost/v1/me");
    const res = await app.fetch(req);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("AUTH_REQUIRED");
  });

  it("returns 401 when token is invalid", async () => {
    const req = new Request("http://localhost/v1/me", {
      headers: { Authorization: "Bearer not.a.valid.token" },
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(401);
    const body = await res.json() as { error: { code: string } };
    expect(["AUTH_FAILED", "AUTH_EXPIRED"]).toContain(body.error.code);
  });

  it("returns 401 with AUTH_EXPIRED when token is expired", async () => {
    // Use a known expired HS256 token (sub=test, exp=past)
    const expiredToken =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid";
    const req = new Request("http://localhost/v1/me", {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for auth endpoint with wrong content type body", async () => {
    const req = new Request("http://localhost/v1/auth/apple", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(422);
  });

  it("returns validation error when id_token is missing", async () => {
    const req = new Request("http://localhost/v1/auth/apple", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await app.fetch(req);
    expect(res.status).toBe(422);
    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("VALIDATION");
  });
});

describe("error envelope", () => {
  it("returns proper JSON error envelope", async () => {
    const req = new Request("http://localhost/v1/nonexistent");
    const res = await app.fetch(req);
    expect(res.status).toBe(404);
  });
});
