import { getVerifiedEmbeddedWhopUserId } from "@/lib/whop-embed";
import LicensePortal from "@/components/LicensePortal";

export default async function EmbeddedLicensePortal() {
  const whopUserId = await getVerifiedEmbeddedWhopUserId();
  if (!whopUserId) {
    return <main className="page"><section className="card">
      <div className="brand"><div className="brand-mark">iT</div><div><div className="brand-name">introverTrader</div><div className="brand-sub">ATAS Indicator Portal</div></div></div>
      <h1>Whop verification required</h1>
      <p className="lead">Open My License from inside your Whop purchase. Your account could not be verified in this session.</p>
      <p className="note">If you are testing the app directly on Vercel, use the regular Whop sign-in at the portal homepage.</p>
    </section></main>;
  }
  return <LicensePortal verifiedEmbeddedWhopUserId={whopUserId}/>;
}
