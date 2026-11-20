import { headers } from "next/headers";
import { Whop } from "@whop/sdk";

/**
 * Whop injects a signed user token into embedded app requests.
 * Verify it server-side; never trust a query-string user ID or decoded JWT.
 */
export async function getVerifiedEmbeddedWhopUserId(): Promise<string | null> {
  const appID = process.env.WHOP_CLIENT_ID;
  const apiKey = process.env.WHOP_API_KEY;
  if (!appID || !apiKey) {
    console.error("[embed] Missing WHOP_CLIENT_ID or WHOP_API_KEY");
    return null;
  }
  const requestHeaders = await headers();
  if (!requestHeaders.has("x-whop-user-token")) return null;
  try {
    const whop = new Whop({ appID, apiKey });
    const { userId } = await whop.verifyUserToken(requestHeaders);
    if (typeof userId !== "string" || !/^user_[a-zA-Z0-9]+$/.test(userId)) return null;
    return userId;
  } catch (error) {
    console.warn("[embed] Embedded user verification failed", error instanceof Error ? error.name : "unknown");
    return null;
  }
}
