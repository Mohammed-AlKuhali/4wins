import type { MiddlewareHandler } from "hono";
import type { ZodSchema, ZodError } from "zod";
import { throwApiError } from "../lib/errors.js";

export function validate<T>(schema: ZodSchema<T>): MiddlewareHandler {
  return async (c, next) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throwApiError("VALIDATION", "Request body must be valid JSON");
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      const ze = result.error as ZodError;
      const fields: Record<string, string> = {};
      for (const issue of ze.issues) {
        fields[issue.path.join(".")] = issue.message;
      }
      throwApiError("VALIDATION", "Validation failed", 422, fields);
    }

    c.set("validatedBody", result.data);
    await next();
  };
}
