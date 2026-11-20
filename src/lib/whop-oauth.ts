import { z } from "zod";
import { getEnv } from "@/lib/env";

function getBaseUrl(): string {
  return getEnv().WHOP_SANDBOX
    ? "https://sandbox-api.whop.com"
    : "https://api.whop.com";
}

const tokenSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  id_token: z.string().optional(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
});

const userInfoSchema = z.object({
  sub: z.string().min(1),
  name: z.string().optional(),
  preferred_username: z.string().optional(),
  picture: z.string().url().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
});

export type WhopTokens = z.infer<typeof tokenSchema>;
export type WhopUserInfo = z.infer<typeof userInfoSchema>;
export interface PkceState { codeVerifier: string; state: string; nonce: string }

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomString(length: number): string {
  return base64url(crypto.getRandomValues(new Uint8Array(length)));
}

async function sha256Challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

export async function buildAuthorizeUrl(pkce: PkceState): Promise<string> {
  const env = getEnv();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.WHOP_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/auth/callback`,
    scope: "openid profile email",
    state: pkce.state,
    nonce: pkce.nonce,
    code_challenge: await sha256Challenge(pkce.codeVerifier),
    code_challenge_method: "S256",
  });
  return `${getBaseUrl()}/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<WhopTokens> {
  const env = getEnv();
  const response = await fetch(`${getBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${env.APP_URL}/api/auth/callback`,
      client_id: env.WHOP_CLIENT_ID,
      client_secret: env.WHOP_CLIENT_SECRET,
      code_verifier: codeVerifier,
    }),
  });
  if (!response.ok) throw new Error(`Whop token exchange failed (${response.status})`);
  return tokenSchema.parse(await response.json());
}

export async function fetchUserInfo(accessToken: string): Promise<WhopUserInfo> {
  const response = await fetch(`${getBaseUrl()}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Whop userinfo failed (${response.status})`);
  return userInfoSchema.parse(await response.json());
}

export async function revokeToken(refreshToken: string): Promise<void> {
  const env = getEnv();
  await fetch(`${getBaseUrl()}/oauth/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ token: refreshToken, client_id: env.WHOP_CLIENT_ID, client_secret: env.WHOP_CLIENT_SECRET }),
  });
}

export function readJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch { return null; }
}
