import type { Context, ErrorHandler } from "hono";
import { ApiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorHandler = (err, c: Context) => {
  if (err instanceof ApiError) {
    const body: Record<string, unknown> = {
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    };
    return c.json(body, err.status as Parameters<typeof c.json>[1]);
  }

  logger.error({ err: err.message, stack: err.stack }, "Unhandled error");

  return c.json(
    { error: { code: "SERVER_ERROR", message: "An unexpected error occurred" } },
    500
  );
};
