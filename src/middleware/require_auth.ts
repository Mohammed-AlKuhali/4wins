import type { MiddlewareHandler } from "hono";
import { verifyAccessToken } from "../domain/auth/jwt.js";
import { throwApiError } from "../lib/errors.js";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throwApiError("AUTH_REQUIRED", "Sign in required", 401);
  }

  const token = authHeader!.slice(7);
  const { userId } = await verifyAccessToken(token);
  c.set("userId", userId);
  await next();
};
