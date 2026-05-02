import { createRemoteJWKSet, jwtVerify } from "jose";
import { throwApiError } from "../../lib/errors.js";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksCachedAt = 0;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function getGoogleJwks() {
  const now = Date.now();
  if (!jwks || now - jwksCachedAt > CACHE_TTL_MS) {
    jwks = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));
    jwksCachedAt = now;
  }
  return jwks;
}

export interface GooglePayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

export async function verifyGoogleToken(
  idToken: string,
  clientIds: string[]
): Promise<GooglePayload> {
  let lastErr: unknown;
  for (const iss of GOOGLE_ISSUERS) {
    for (const aud of clientIds) {
      try {
        const { payload } = await jwtVerify(idToken, getGoogleJwks(), {
          issuer: iss,
          audience: aud,
        });
        if (!payload.sub) throwApiError("AUTH_FAILED", "Authentication failed", 401);
        return {
          sub: payload.sub!,
          email: typeof payload.email === "string" ? payload.email : undefined,
          email_verified: payload.email_verified === true,
        };
      } catch (err: unknown) {
        if (err instanceof Error && err.constructor.name === "ApiError") throw err;
        lastErr = err;
      }
    }
  }
  void lastErr;
  throwApiError("AUTH_FAILED", "Authentication failed", 401);
}
