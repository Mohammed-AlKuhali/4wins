import { SignJWT, jwtVerify } from "jose";
import { env } from "../../lib/env.js";
import { throwApiError } from "../../lib/errors.js";

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ACCESS_EXPIRY = "1h";

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<{ userId: string }> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "access" || !payload.sub) {
      throwApiError("AUTH_FAILED", "Invalid token", 401);
    }
    return { userId: payload.sub! };
  } catch (err: unknown) {
    if (err instanceof Error && err.constructor.name === "ApiError") throw err;
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("expired")) {
      throwApiError("AUTH_EXPIRED", "Token expired", 401);
    }
    throwApiError("AUTH_FAILED", "Invalid token", 401);
  }
}
