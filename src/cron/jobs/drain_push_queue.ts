import { drainPushQueue } from "../../domain/push/drain_queue.js";
import { logger } from "../../lib/logger.js";

export async function drainPushQueueJob(): Promise<void> {
  const sent = await drainPushQueue();
  logger.info({ sent }, "Push queue drained");
}
