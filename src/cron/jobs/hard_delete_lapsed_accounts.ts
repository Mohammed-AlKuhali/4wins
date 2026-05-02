import { hardDeleteLapsedAccounts } from "../../domain/users/hard_delete.js";
import { logger } from "../../lib/logger.js";

export async function hardDeleteLapsedAccountsJob(): Promise<void> {
  const deleted = await hardDeleteLapsedAccounts();
  logger.info({ deleted }, "Hard-deleted lapsed accounts");
}
