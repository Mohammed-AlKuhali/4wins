import { describe, it, expect } from "vitest";
import { getUserLocalTime } from "../src/cron/lib/user_local_now.js";
import { shouldRunAt4am, shouldRunMorningCue, shouldRunMonthly, shouldRunSundayEvening } from "../src/cron/lib/should_run_at.js";

describe("getUserLocalTime", () => {
  it("returns correct date for UTC", () => {
    const now = new Date("2026-05-02T08:30:00Z");
    const t = getUserLocalTime("UTC", now);
    expect(t.date).toBe("2026-05-02");
    expect(t.hour).toBe(8);
    expect(t.minute).toBe(30);
  });

  it("returns correct date for New York (UTC-4 in May)", () => {
    const now = new Date("2026-05-02T08:30:00Z");
    const t = getUserLocalTime("America/New_York", now);
    expect(t.date).toBe("2026-05-02");
    expect(t.hour).toBe(4);
    expect(t.minute).toBe(30);
  });
});

describe("shouldRunAt4am", () => {
  it("fires at 04:00", () => {
    const t = { date: "2026-05-02", hour: 4, minute: 0, dayOfWeek: 6, monthDay: 2, monthYear: "2026-05" };
    expect(shouldRunAt4am(t)).toBe(true);
  });

  it("does not fire at 04:10", () => {
    const t = { date: "2026-05-02", hour: 4, minute: 10, dayOfWeek: 6, monthDay: 2, monthYear: "2026-05" };
    expect(shouldRunAt4am(t)).toBe(false);
  });
});

describe("shouldRunMorningCue", () => {
  it("fires at configured cue time", () => {
    const t = { date: "2026-05-02", hour: 7, minute: 30, dayOfWeek: 6, monthDay: 2, monthYear: "2026-05" };
    expect(shouldRunMorningCue(t, "07:30:00")).toBe(true);
  });

  it("does not fire at different time", () => {
    const t = { date: "2026-05-02", hour: 9, minute: 0, dayOfWeek: 6, monthDay: 2, monthYear: "2026-05" };
    expect(shouldRunMorningCue(t, "07:30:00")).toBe(false);
  });
});

describe("shouldRunMonthly", () => {
  it("fires at 00:00 on 1st of month", () => {
    const t = { date: "2026-06-01", hour: 0, minute: 1, dayOfWeek: 1, monthDay: 1, monthYear: "2026-06" };
    expect(shouldRunMonthly(t)).toBe(true);
  });

  it("does not fire on other days", () => {
    const t = { date: "2026-05-15", hour: 0, minute: 1, dayOfWeek: 5, monthDay: 15, monthYear: "2026-05" };
    expect(shouldRunMonthly(t)).toBe(false);
  });
});

describe("shouldRunSundayEvening", () => {
  it("fires on Sunday at cue time", () => {
    const t = { date: "2026-05-03", hour: 20, minute: 0, dayOfWeek: 0, monthDay: 3, monthYear: "2026-05" };
    expect(shouldRunSundayEvening(t, "20:00:00")).toBe(true);
  });

  it("does not fire on Monday", () => {
    const t = { date: "2026-05-04", hour: 20, minute: 0, dayOfWeek: 1, monthDay: 4, monthYear: "2026-05" };
    expect(shouldRunSundayEvening(t, "20:00:00")).toBe(false);
  });
});

describe("Internal cron endpoint", () => {
  it("returns 401 without secret", async () => {
    const app = (await import("../src/app.js")).default;
    const res = await app.fetch(new Request("http://localhost/v1/internal/cron", { method: "POST" }));
    expect(res.status).toBe(401);
  });
});
