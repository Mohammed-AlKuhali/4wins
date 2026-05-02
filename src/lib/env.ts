import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(8787),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID_IOS: z.string().optional(),
  GOOGLE_CLIENT_ID_ANDROID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  EXPO_ACCESS_TOKEN: z.string().optional(),
  APP_STORE_SHARED_SECRET: z.string().optional(),
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Environment validation failed:\n${missing}`);
}

export const env = parsed.data;
