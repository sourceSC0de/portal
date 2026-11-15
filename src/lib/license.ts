import { getSupabaseAdmin } from "@/lib/supabase-admin";

export interface LicenseRecord {
  id: string;
  license_key: string | null;
  customer_email: string | null;
  is_active: boolean | null;
  expires_at: string | null;
  created_at: string;
}

export async function findLicenseForVerifiedEmail(email: string): Promise<LicenseRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await getSupabaseAdmin()
    .from("licenses")
    .select("id, license_key, customer_email, is_active, expires_at, created_at")
    .eq("customer_email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("[license] Supabase lookup failed:", error.message);
    throw new Error("The license service is temporarily unavailable.");
  }
  if (!data?.length) return null;
  if (data.length > 1) throw new Error("More than one license is linked to this email. Please contact support so we can link the correct license.");
  return data[0] as LicenseRecord;
}
