import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { revokeToken } from "@/lib/whop-oauth";
import { getEnv } from "@/lib/env";

export async function POST() {
  const session = await getSession();
  if (session.tokens?.refresh_token) {
    try { await revokeToken(session.tokens.refresh_token); }
    catch (error) { console.warn("[oauth] token revocation failed:", error instanceof Error ? error.message : "unknown error"); }
  }
  session.destroy();
  return NextResponse.redirect(new URL("/", getEnv().NEXT_PUBLIC_APP_URL), { status: 303 });
}
