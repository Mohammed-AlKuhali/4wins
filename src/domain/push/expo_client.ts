import { env } from "../../lib/env.js";
import { logger } from "../../lib/logger.js";

export interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  sound?: string | null;
  data?: Record<string, unknown>;
}

export interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

const EXPO_URL = "https://exp.host/--/api/v2/push/send";

export async function sendExpoPush(messages: ExpoMessage[]): Promise<ExpoTicket[]> {
  if (env.PUSH_DISABLED === "true") {
    logger.info({ count: messages.length }, "Push disabled via PUSH_DISABLED env var");
    return messages.map(() => ({ status: "ok" as const }));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (env.EXPO_ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${env.EXPO_ACCESS_TOKEN}`;
  }

  const res = await fetch(EXPO_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    logger.error({ status: res.status }, "Expo push API error");
    throw new Error(`Expo push API returned ${res.status}`);
  }

  const json = await res.json() as { data: ExpoTicket[] };
  return json.data;
}
