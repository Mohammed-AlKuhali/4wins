import { Hono } from "hono";
import { sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import { env } from "../lib/env.js";

const health = new Hono();

const SERVER_START = Date.now();
const GIT_SHA = process.env.GIT_SHA ?? "unknown";

type HealthStatus = "ok" | "degraded";

interface HealthCache {
  ai: HealthStatus;
  cachedAt: number;
}

let aiCache: HealthCache | null = null;
const AI_CACHE_TTL_MS = 30_000;

async function checkDb(): Promise<HealthStatus> {
  try {
    await db.execute(sql`SELECT 1`);
    return "ok";
  } catch {
    return "degraded";
  }
}

async function checkAi(): Promise<HealthStatus> {
  const now = Date.now();
  if (aiCache && now - aiCache.cachedAt < AI_CACHE_TTL_MS) {
    return aiCache.ai;
  }

  let aiStatus: HealthStatus = "ok";

  const checks = [
    env.ANTHROPIC_API_KEY
      ? fetch("https://api.anthropic.com", { method: "HEAD", signal: AbortSignal.timeout(3000) })
          .then(() => "ok" as const)
          .catch(() => "degraded" as const)
      : Promise.resolve("ok" as const),
    env.OPENAI_API_KEY
      ? fetch("https://api.openai.com", { method: "HEAD", signal: AbortSignal.timeout(3000) })
          .then(() => "ok" as const)
          .catch(() => "degraded" as const)
      : Promise.resolve("ok" as const),
  ];

  const results = await Promise.all(checks);
  if (results.some((r) => r === "degraded")) aiStatus = "degraded";

  aiCache = { ai: aiStatus, cachedAt: now };
  return aiStatus;
}

health.get("/", async (c) => {
  const [dbStatus, aiStatus] = await Promise.all([checkDb(), checkAi()]);
  const status: HealthStatus = dbStatus === "ok" && aiStatus === "ok" ? "ok" : "degraded";
  const uptimeSeconds = Math.floor((Date.now() - SERVER_START) / 1000);
  return c.json({
    status,
    db: dbStatus,
    ai: aiStatus,
    git_sha: GIT_SHA,
    uptime_seconds: uptimeSeconds,
  });
});

export default health;
