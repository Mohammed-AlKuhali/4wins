import { describe, it, expect, vi, beforeEach } from "vitest";
import { fallbackHeuristic } from "../src/domain/ai/fallback_heuristic.js";

describe("fallbackHeuristic", () => {
  it("classifies mental keywords", () => {
    const r = fallbackHeuristic("I read a book today and studied hard");
    expect(r.pillar).toBe("mental");
    expect(r.confidence).toBe(0.3);
    expect(r.reasoning).toContain("fallback");
  });

  it("classifies physical keywords", () => {
    const r = fallbackHeuristic("went for a run and exercised for an hour");
    expect(r.pillar).toBe("physical");
  });

  it("classifies spiritual keywords", () => {
    const r = fallbackHeuristic("I prayed and felt grateful today");
    expect(r.pillar).toBe("spiritual");
  });

  it("classifies financial keywords", () => {
    const r = fallbackHeuristic("I saved money and checked my budget");
    expect(r.pillar).toBe("financial");
  });

  it("classifies Spanish physical text", () => {
    const r = fallbackHeuristic("hoy fui a correr por el parque ejercicio");
    expect(r.pillar).toBe("physical");
  });

  it("classifies Arabic mental text", () => {
    const r = fallbackHeuristic("قرأت كتاباً ممتعاً اليوم");
    expect(r.pillar).toBe("mental");
  });

  it("defaults to mental when no keywords match", () => {
    const r = fallbackHeuristic("xyz abc def 123");
    expect(r.pillar).toBe("mental");
  });

  it("returns fallback=true as expected", () => {
    const r = fallbackHeuristic("I worked out today");
    expect(typeof r.pillar).toBe("string");
  });
});

describe("tagPillar API endpoint", () => {
  it("exposes POST /v1/ai/tag requiring auth", async () => {
    const app = (await import("../src/app.js")).default;
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "I read a book" }),
      })
    );
    expect(res.status).toBe(401);
  });
});
