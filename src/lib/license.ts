import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface LicenseRecord {
  id: string;
  license_key: string | null;
  customer_email: string | null;
  is_active: boolean | null;
  expires_at: string | null;
  created_at: string;
}

/**
 * The payment webhook persists the verified Whop user ID in public.licenses.
 * Do not use email, URL parameters, or a client-provided user ID as a fallback.
 * Multiple licenses for one Whop user require manual review.
 */
export async function findLicenseForWhopUser(whopUserId: string): Promise<LicenseRecord | null> {
  if (!/^user_[A-Za-z0-9]+$/.test(whopUserId)) {
    throw new Error("Invalid Whop account identifier.");
  }

  const { data, error } = await getSupabaseAdmin()
    .from("licenses")
    .select("id, license_key, customer_email, is_active, expires_at, created_at")
    .eq("whop_user_id", whopUserId)
    .limit(2);

  if (error) {
    console.error("[license] Supabase lookup failed:", error.message);
    throw new Error("The license service is temporarily unavailable.");
  }
  if (!data?.length) return null;
  if (data.length > 1) {
    throw new Error("Multiple licenses are linked to this Whop account. Please contact support.");
  }
  return data[0] as LicenseRecord;
}
