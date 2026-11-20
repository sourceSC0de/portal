import { NextRequest, NextResponse } from "next/server";
import { clearPkceCookie, readPkceCookie } from "@/lib/pkce-cookie";
import { exchangeCodeForTokens, fetchUserInfo, readJwtPayload } from "@/lib/whop-oauth";
import { getSession } from "@/lib/session";
import { getEnv } from "@/lib/env";

function redirectTo(path: string) { return NextResponse.redirect(new URL(path, getEnv().APP_URL)); }

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  if (error) {
    await clearPkceCookie();
    console.warn("[oauth] authorization error:", error);
    return redirectTo("/?error=oauth_denied");
  }
  if (!code || !returnedState) return redirectTo("/?error=missing_params");
  const pkce = await readPkceCookie();
  if (!pkce || pkce.state !== returnedState) {
    await clearPkceCookie();
    return redirectTo("/?error=state_mismatch");
  }

  try {
    const tokens = await exchangeCodeForTokens(code, pkce.codeVerifier);
    if (!tokens.id_token) throw new Error("Whop did not return an ID token.");
    const idPayload = readJwtPayload(tokens.id_token);
    if (!idPayload || idPayload.nonce !== pkce.nonce) throw new Error("Whop ID token nonce validation failed.");
    const user = await fetchUserInfo(tokens.access_token);
    const session = await getSession();
    session.user = user;
    session.tokens = tokens;
    await session.save();
    await clearPkceCookie();
    return redirectTo("/dashboard");
  } catch (err) {
    console.error("[oauth] callback failed:", err instanceof Error ? err.message : "unknown error");
    await clearPkceCookie();
    return redirectTo("/?error=oauth_failed");
  }
}
