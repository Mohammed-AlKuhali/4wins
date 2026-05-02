import { describe, it, expect } from "vitest";

describe("rate limiter middleware", () => {
  it("exposes authLimiter", async () => {
    const mod = await import("../src/middleware/rate_limit.js");
    expect(typeof mod.authLimiter).toBe("function");
  });

  it("exposes writeLimiter", async () => {
    const mod = await import("../src/middleware/rate_limit.js");
    expect(typeof mod.writeLimiter).toBe("function");
  });

  it("exposes transcribeLimiter", async () => {
    const mod = await import("../src/middleware/rate_limit.js");
    expect(typeof mod.transcribeLimiter).toBe("function");
  });
});
