import { cookies } from "next/headers";
import { z } from "zod";
import type { PkceState } from "@/lib/whop-oauth";

const COOKIE = "whop_pkce";
const schema = z.object({ codeVerifier: z.string(), state: z.string(), nonce: z.string() });

export async function setPkceCookie(value: PkceState): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(value), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600,
  });
}
export async function readPkceCookie(): Promise<PkceState | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  try { return schema.parse(JSON.parse(value)); } catch { return null; }
}
export async function clearPkceCookie(): Promise<void> { (await cookies()).delete(COOKIE); }
