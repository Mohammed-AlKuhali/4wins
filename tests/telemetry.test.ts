import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, lt, gte } from "drizzle-orm";
import * as schema from "../src/db/schema/index.js";
import { auditEvents } from "../src/db/schema/audit_events.js";
import { signAccessToken } from "../src/domain/auth/jwt.js";
import { appendAuditEvent } from "../src/domain/audit/append.js";
import { cleanupAuditEventsJob } from "../src/cron/jobs/cleanup_audit_events.js";
import app from "../src/app.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

let userId: string;
let token: string;

beforeAll(async () => {
  userId = crypto.randomUUID();
  await db.insert(schema.users).values({
    id: userId,
    email: `telemetry-${userId}@4wins.test`,
    tradition: "secular",
    timezone: "UTC",
  });
  token = await signAccessToken(userId);
});

afterAll(async () => {
  await db.delete(auditEvents).where(eq(auditEvents.userId, userId));
  await db.delete(schema.users).where(eq(schema.users.id, userId));
  await client.end();
});

// ─── POST /v1/audit — happy path ───────────────────────────────────────────

describe("POST /v1/audit — happy path", () => {
  it("returns 201 and persists the event", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/audit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_type: "screen_view",
          metadata: { screen: "/home", locale: "en", mode: "dark" },
        }),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.ok).toBe(true);

    const rows = await db
      .select()
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.userId, userId),
          eq(auditEvents.event, "screen_view"),
        ),
      );
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect((rows[0].metadata as Record<string, unknown>).screen).toBe("/home");
  });

  it("accepts event without metadata", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/audit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event_type: "day_closed" }),
      }),
    );
    expect(res.status).toBe(201);
  });
});

// ─── POST /v1/audit — runtime banned key rejection ─────────────────────────

describe("POST /v1/audit — banned key rejection", () => {
  const BANNED_CASES = [
    { key: "raw_text", value: "I went for a run today" },
    { key: "email", value: "user@example.com" },
    { key: "identity_statement", value: "I am someone who..." },
    { key: "custom_tradition_text", value: "My practice" },
    { key: "password", value: "secret" },
  ];

  for (const { key, value } of BANNED_CASES) {
    it(`rejects metadata with banned key: "${key}"`, async () => {
      const res = await app.fetch(
        new Request("http://localhost/v1/audit", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "screen_view",
            metadata: { screen: "/home", [key]: value },
          }),
        }),
      );
      expect(res.status).toBe(422);
      const body = await res.json() as Record<string, unknown>;
      expect(body.error).toBeTruthy();
    });
  }
});

// ─── POST /v1/audit — auth required ────────────────────────────────────────

describe("POST /v1/audit — auth required", () => {
  it("returns 401 without token", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "screen_view" }),
      }),
    );
    expect(res.status).toBe(401);
  });
});

// ─── appendAuditEvent domain function ──────────────────────────────────────

describe("appendAuditEvent", () => {
  it("inserts a row with the correct event name and metadata", async () => {
    await appendAuditEvent(userId, "pillar_capture_completed", {
      pillar: "mental",
      input_method: "type",
      time_ms: 4200,
    });

    const rows = await db
      .select()
      .from(auditEvents)
      .where(
        and(
          eq(auditEvents.userId, userId),
          eq(auditEvents.event, "pillar_capture_completed"),
        ),
      );

    expect(rows.length).toBeGreaterThanOrEqual(1);
    const meta = rows[0].metadata as Record<string, unknown>;
    expect(meta.pillar).toBe("mental");
    expect(meta.input_method).toBe("type");
    expect(meta.time_ms).toBe(4200);
  });

  it("stores userId as null-safe (null userId stores row with null)", async () => {
    const id = crypto.randomUUID();
    await db.insert(auditEvents).values({
      id,
      userId: null,
      event: "system_test",
      metadata: {},
    });
    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.id, id));
    expect(rows.length).toBe(1);
    expect(rows[0].userId).toBeNull();
    await db.delete(auditEvents).where(eq(auditEvents.id, id));
  });
});

// ─── cleanupAuditEventsJob ──────────────────────────────────────────────────

describe("cleanupAuditEventsJob", () => {
  it("deletes events older than 90 days and returns count", async () => {
    const oldDate = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000);
    const oldId = crypto.randomUUID();
    const recentId = crypto.randomUUID();

    await db.insert(auditEvents).values([
      {
        id: oldId,
        userId,
        event: "screen_view",
        metadata: { screen: "/old" },
        createdAt: oldDate,
      },
      {
        id: recentId,
        userId,
        event: "screen_view",
        metadata: { screen: "/recent" },
        createdAt: new Date(),
      },
    ]);

    const deleted = await cleanupAuditEventsJob();
    expect(deleted).toBeGreaterThanOrEqual(1);

    const oldRow = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.id, oldId));
    expect(oldRow.length).toBe(0);

    const recentRow = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.id, recentId));
    expect(recentRow.length).toBe(1);

    await db.delete(auditEvents).where(eq(auditEvents.id, recentId));
  });

  it("is idempotent — calling twice does not double-delete", async () => {
    const count1 = await cleanupAuditEventsJob();
    const count2 = await cleanupAuditEventsJob();
    expect(count2).toBe(0);
    expect(count1).toBeGreaterThanOrEqual(0);
  });

  it("does not delete events exactly 89 days old", async () => {
    const borderDate = new Date(Date.now() - 89 * 24 * 60 * 60 * 1000);
    const borderId = crypto.randomUUID();

    await db.insert(auditEvents).values({
      id: borderId,
      userId,
      event: "screen_view",
      metadata: { screen: "/border" },
      createdAt: borderDate,
    });

    await cleanupAuditEventsJob();

    const row = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.id, borderId));
    expect(row.length).toBe(1);

    await db.delete(auditEvents).where(eq(auditEvents.id, borderId));
  });
});

// ─── TypeScript compile-time guard (documented, enforced via types) ─────────
//
// The AllowedKey union in apps/mobile/lib/telemetry.ts restricts metadata keys
// at compile time. A call like:
//   track('screen_view', { raw_text: 'foo' })
// produces a TypeScript error: 'raw_text' is not assignable to 'AllowedKey'.
//
// Runtime enforcement is handled by the banned-key check in POST /v1/audit,
// tested above. Both layers work in concert.
