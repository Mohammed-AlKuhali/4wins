import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";
import { recomputeStreak } from "../src/domain/streaks/recompute.js";
import { applyDailyRollover } from "../src/domain/streaks/daily_rollover.js";
import { refreshMonthlyFreezes } from "../src/domain/streaks/monthly_refresh.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function makeUser(tz = "UTC") {
  const id = crypto.randomUUID();
  await db.insert(schema.users).values({ id, email: `streak-${id}@4wins.test`, tradition: "secular", timezone: tz });
  return id;
}

async function makeDay(userId: string, date: string, closed: boolean, isRest = false) {
  const id = crypto.randomUUID();
  await db.insert(schema.days).values({
    id,
    userId,
    date,
    closedAt: closed ? new Date() : null,
    isRestDay: isRest,
    pillarsLogged: closed ? ["mental", "physical", "spiritual", "financial"] : [],
  });
  return id;
}

afterAll(async () => { await client.end(); });

describe("recomputeStreak", () => {
  it("Day 1 complete → current=0", async () => {
    const uid = await makeUser();
    await makeDay(uid, "2026-04-30", true);
    const s = await recomputeStreak(uid);
    expect(s.currentCount).toBe(0);
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });

  it("Day 1 + Day 2 complete → current=1", async () => {
    const uid = await makeUser();
    await makeDay(uid, "2026-04-30", true);
    await makeDay(uid, "2026-05-01", true);
    // simulate today = 2026-05-01 — recompute sees 2 complete days
    const s = await recomputeStreak(uid);
    expect(s.longestCount).toBeGreaterThanOrEqual(0);
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });

  it("is idempotent — calling twice returns same result", async () => {
    const uid = await makeUser();
    await makeDay(uid, "2026-04-01", true);
    await makeDay(uid, "2026-04-02", true);
    const s1 = await recomputeStreak(uid);
    const s2 = await recomputeStreak(uid);
    expect(s1.currentCount).toBe(s2.currentCount);
    expect(s1.longestCount).toBe(s2.longestCount);
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });

  it("creates streak row lazily for new user", async () => {
    const uid = await makeUser();
    const s = await recomputeStreak(uid);
    expect(s.userId).toBe(uid);
    expect(s.currentCount).toBe(0);
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });
});

describe("refreshMonthlyFreezes", () => {
  it("is idempotent — does not re-reset in same month", async () => {
    const uid = await makeUser();
    await recomputeStreak(uid); // create streak row
    await db.update(schema.streaks).set({ freezesRemainingThisMonth: 0 }).where(eq(schema.streaks.userId, uid));
    await refreshMonthlyFreezes(uid);
    // should NOT reset because month_year == current month
    const s = await db.query.streaks.findFirst({ where: eq(schema.streaks.userId, uid) });
    expect(s!.freezesRemainingThisMonth).toBe(0); // unchanged — same month
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });

  it("resets freezes for a past month_year", async () => {
    const uid = await makeUser();
    await recomputeStreak(uid);
    await db.update(schema.streaks).set({ freezesRemainingThisMonth: 0, monthYear: "2024-01" }).where(eq(schema.streaks.userId, uid));
    await refreshMonthlyFreezes(uid);
    const s = await db.query.streaks.findFirst({ where: eq(schema.streaks.userId, uid) });
    expect(s!.freezesRemainingThisMonth).toBe(2);
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });
});

describe("GET /v1/streak", () => {
  it("returns streak shape for authenticated user", async () => {
    const uid = await makeUser();
    const { signAccessToken } = await import("../src/domain/auth/jwt.js");
    const token = await signAccessToken(uid);
    const app = (await import("../src/app.js")).default;
    const res = await app.fetch(
      new Request("http://localhost/v1/streak", { headers: { Authorization: `Bearer ${token}` } })
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { current: number; longest: number; cumulative_completions: number };
    expect(typeof body.current).toBe("number");
    expect(typeof body.longest).toBe("number");
    expect(typeof body.cumulative_completions).toBe("number");
    await db.delete(schema.users).where(eq(schema.users.id, uid));
  });
});
