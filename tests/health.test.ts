import { describe, it, expect } from "vitest";
import app from "../src/app.js";

describe("GET /v1/health", () => {
  it("returns 200 with status ok", async () => {
    const req = new Request("http://localhost/v1/health");
    const res = await app.fetch(req);
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string; db: string; ai: string };
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
    expect(typeof body.ai).toBe("string");
  });
});
