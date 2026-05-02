import { lt } from "drizzle-orm";
import { db } from "../../lib/db.js";
import { auditEvents } from "../../db/schema/audit_events.js";
import { logger } from "../../lib/logger.js";

const RETENTION_DAYS = 90;

export async function cleanupAuditEventsJob(): Promise<number> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const deleted = await db
    .delete(auditEvents)
    .where(lt(auditEvents.createdAt, cutoff))
    .returning({ id: auditEvents.id });

  const count = deleted.length;
  logger.info({ cutoff: cutoff.toISOString(), deleted: count }, "cleanup_audit_events complete");
  return count;
}
