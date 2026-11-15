import { NextResponse } from "next/server";
import { buildAuthorizeUrl, randomString, type PkceState } from "@/lib/whop-oauth";
import { setPkceCookie } from "@/lib/pkce-cookie";

export async function GET() {
  const pkce: PkceState = { codeVerifier: randomString(48), state: randomString(24), nonce: randomString(24) };
  await setPkceCookie(pkce);
  return NextResponse.redirect(await buildAuthorizeUrl(pkce));
}
