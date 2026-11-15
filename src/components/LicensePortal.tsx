import { requireUser } from "@/lib/session";
import { findLicenseForVerifiedEmail } from "@/lib/license";
import { getEnv } from "@/lib/env";
import CopyButton from "@/components/copy-button";

function formatExpiry(value: string | null): string {
  if (!value) return "No expiry date recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default async function LicensePortal() {
  const user = await requireUser();
  if (!user.email || user.email_verified !== true) {
    return <main className="page"><section className="card"><Brand/><h1>Email verification required</h1><p className="lead">Whop did not provide a verified email address for this account. We cannot safely match your license yet.</p><form action="/api/auth/logout" method="post"><button className="button secondary" type="submit">Sign out</button></form></section></main>;
  }

  let license = null;
  let lookupError: string | null = null;
  try { license = await findLicenseForVerifiedEmail(user.email); }
  catch (error) { lookupError = error instanceof Error ? error.message : "Unable to retrieve your license."; }

  const now = Date.now();
  const notExpired = !license?.expires_at || new Date(license.expires_at).getTime() > now;
  const active = Boolean(license?.is_active && notExpired);
  const downloadUrl = getEnv().INDICATOR_DOWNLOAD_URL;

  return <main className="page"><section className="card">
    <Brand/>
    <h1>My ATAS License</h1>
    <p className="lead">Your introverTrader indicator bundle license and download details.</p>
    {lookupError ? <div className="error">{lookupError}</div> : !license ? <div className="error">No license was found for <strong>{user.email}</strong>. Make sure you are signed in to the Whop account used for your purchase. If you believe this is a mistake, contact support.</div> : <>
      <div className="panel">
        <div className="label">Whop account email</div><div className="email">{user.email}</div>
      </div>
      <div className="panel">
        <div className="label">Your license key</div>
        {license.license_key ? <div className="key-row"><code className="key">{license.license_key}</code><CopyButton value={license.license_key}/></div> : <p className="note">No license key is currently stored for this record. Please contact support.</p>}
        <div className="meta"><span>License status</span><strong className={`status ${active ? "active" : "inactive"}`}>{active ? "Active" : "Inactive"}</strong></div>
        <div className="meta"><span>Expires</span><strong>{formatExpiry(license.expires_at)}</strong></div>
      </div>
      {downloadUrl ? <a className="download" href={downloadUrl} target="_blank" rel="noreferrer">Download latest indicators (.zip) ↗</a> : <p className="note">The download link has not been configured yet.</p>}
      {!active && <p className="note">Your license is currently inactive or has expired. The key is shown for reference but may not authenticate in ATAS.</p>}
    </>}
    <div className="footer"><span>Signed in as {user.name ?? user.preferred_username ?? user.email}</span><form action="/api/auth/logout" method="post"><button className="text-button" type="submit">Sign out</button></form></div>
  </section></main>;
}

function Brand() { return <div className="brand"><div className="brand-mark">iT</div><div><div className="brand-name">introverTrader</div><div className="brand-sub">ATAS Indicator Portal</div></div></div>; }
