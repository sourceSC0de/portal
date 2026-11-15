import { z } from "zod";

const envSchema = z.object({
  WHOP_CLIENT_ID: z.string().startsWith("app_"),
  WHOP_CLIENT_SECRET: z.string().min(1),
  WHOP_SANDBOX: z.string().optional().transform((value) => value === "true"),
  SESSION_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  INDICATOR_DOWNLOAD_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;
let cached: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (!cached) {
    cached = envSchema.parse({
      WHOP_CLIENT_ID: process.env.WHOP_CLIENT_ID,
      WHOP_CLIENT_SECRET: process.env.WHOP_CLIENT_SECRET,
      WHOP_SANDBOX: process.env.WHOP_SANDBOX,
      SESSION_SECRET: process.env.SESSION_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      INDICATOR_DOWNLOAD_URL: process.env.INDICATOR_DOWNLOAD_URL,
    });
  }
  return cached;
}
