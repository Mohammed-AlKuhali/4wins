import { db } from '../../lib/db.js';
import { auditEvents } from '../../db/schema/audit_events.js';

export async function appendAuditEvent(
  userId: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await db.insert(auditEvents).values({
    id: crypto.randomUUID(),
    userId,
    eventType,
    metadata,
  });
}
