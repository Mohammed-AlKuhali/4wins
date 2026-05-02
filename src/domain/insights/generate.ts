import { eq, and, isNotNull, count, sql } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { days } from "../../db/schema/days.js";
import { entries } from "../../db/schema/entries.js";
import { insights } from "../../db/schema/insights.js";
import { auditEvents } from "../../db/schema/audit_events.js";

type Pillar = "mental" | "physical" | "spiritual" | "financial";
const PILLARS: Pillar[] = ["mental", "physical", "spiritual", "financial"];

export async function generateDay30Insights(userId: string): Promise<void> {
  // Check existing to be idempotent
  const existing = await db.query.insights.findFirst({ where: eq(insights.userId, userId) });
  if (existing) return;

  // Fetch last 90 non-rest days
  const recentDays = await db
    .select()
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.isRestDay, false)))
    .orderBy(days.date)
    .limit(90);

  const closedDays = recentDays.filter((d) => d.closedAt !== null);
  if (closedDays.length < 30) return;

  const now = new Date();
  const toInsert: typeof insights.$inferInsert[] = [];

  // 1. pillar_consistency
  const pillarCounts: Record<Pillar, number> = { mental: 0, physical: 0, spiritual: 0, financial: 0 };
  for (const d of recentDays) {
    for (const p of d.pillarsLogged as Pillar[]) {
      pillarCounts[p] = (pillarCounts[p] ?? 0) + 1;
    }
  }
  const topPillar = (Object.entries(pillarCounts) as [Pillar, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a), ["mental" as Pillar, 0]
  );

  toInsert.push({
    id: crypto.randomUUID(),
    userId,
    generatedAt: now,
    type: "pillar_consistency",
    payload: {
      days_complete: closedDays.length,
      days_total: recentDays.length,
      top_pillar: topPillar[0],
      top_pillar_count: topPillar[1],
    },
    isPaywalled: false,
  });

  // 2. time_of_day_pattern — which day-of-week has the most of the top pillar
  const dowCounts: number[] = Array(7).fill(0);
  for (const d of recentDays) {
    if ((d.pillarsLogged as string[]).includes(topPillar[0])) {
      const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
      dowCounts[dow]++;
    }
  }
  const topDow = dowCounts.indexOf(Math.max(...dowCounts));
  const topDowPct = recentDays.length > 0 ? dowCounts[topDow] / recentDays.length : 0;

  toInsert.push({
    id: crypto.randomUUID(),
    userId,
    generatedAt: now,
    type: "time_of_day_pattern",
    payload: {
      pillar: topPillar[0],
      cluster_day_of_week: topDow,
      cluster_pct: Math.round(topDowPct * 100) / 100,
    },
    isPaywalled: false,
  });

  // 3. cross_pillar_correlation
  const n = recentDays.length;
  if (n >= 30) {
    const fullQuadTotal = closedDays.length;
    let bestPillar: Pillar | null = null;
    let bestLift = 0;

    for (const p of PILLARS) {
      const withPillar = recentDays.filter((d) => (d.pillarsLogged as string[]).includes(p));
      const withPillarClosed = withPillar.filter((d) => d.closedAt !== null).length;
      const withoutPillar = recentDays.filter((d) => !(d.pillarsLogged as string[]).includes(p));
      const withoutPillarClosed = withoutPillar.filter((d) => d.closedAt !== null).length;

      const pWith = withPillar.length > 0 ? withPillarClosed / withPillar.length : 0;
      const pWithout = withoutPillar.length > 0 ? withoutPillarClosed / withoutPillar.length : 0;

      if (pWithout > 0 && pWith / pWithout > bestLift) {
        bestLift = pWith / pWithout;
        bestPillar = p;
      }
    }

    if (bestPillar && bestLift >= 1.5) {
      toInsert.push({
        id: crypto.randomUUID(),
        userId,
        generatedAt: now,
        type: "cross_pillar_correlation",
        payload: {
          pillar: bestPillar,
          full_quad_lift: Math.round(bestLift * 10) / 10,
          n,
        },
        isPaywalled: true,
      });
    }
  }

  for (const row of toInsert) {
    await db.insert(insights).values(row).onConflictDoNothing();
  }

  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    event: "insights_generated",
    metadata: { types: toInsert.map((r) => r.type) },
  });
}
