import { createRemoteJWKSet, jwtVerify } from "jose";
import { throwApiError } from "../../lib/errors.js";

const APPLE_JWKS_URL = "https://appleid.apple.com/auth/keys";
const APPLE_ISSUER = "https://appleid.apple.com";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCachedAt = 0;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function getAppleJwks() {
  const now = Date.now();
  if (!jwks || now - jwksCachedAt > CACHE_TTL_MS) {
    jwks = createRemoteJWKSet(new URL(APPLE_JWKS_URL));
    jwksCachedAt = now;
  }
  return jwks;
}

export interface ApplePayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

export async function verifyAppleToken(
  idToken: string,
  bundleId: string
): Promise<ApplePayload> {
  try {
    const { payload } = await jwtVerify(idToken, getAppleJwks(), {
      issuer: APPLE_ISSUER,
      audience: bundleId,
    });
    if (!payload.sub) throwApiError("AUTH_FAILED", "Authentication failed", 401);
    return {
      sub: payload.sub!,
      email: typeof payload.email === "string" ? payload.email : undefined,
      email_verified: payload.email_verified === true,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.constructor.name === "ApiError") throw err;
    throwApiError("AUTH_FAILED", "Authentication failed", 401);
  }
}
