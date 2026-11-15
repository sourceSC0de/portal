import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";
import type { WhopTokens, WhopUserInfo } from "@/lib/whop-oauth";

export interface SessionData { user?: WhopUserInfo; tokens?: WhopTokens }
export function sessionOptions(): SessionOptions {
  return {
    password: getEnv().SESSION_SECRET,
    cookieName: "whop_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
export async function getCurrentUser(): Promise<WhopUserInfo | null> {
  const session = await getSession();
  return session.user ?? null;
}
export async function requireUser(): Promise<WhopUserInfo> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}
