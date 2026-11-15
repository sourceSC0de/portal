import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const errorText = params.error ? "Whop sign-in could not be completed. Please try again." : null;
  return <main className="page"><section className="card">
    <div className="brand"><div className="brand-mark">iT</div><div><div className="brand-name">introverTrader</div><div className="brand-sub">ATAS Indicator Portal</div></div></div>
    <h1>My License</h1>
    <p className="lead">View your ATAS indicator license key, check its status and download the latest bundle.</p>
    {errorText && <p className="error">{errorText}</p>}
    {user ? <Link className="button full" href="/dashboard">Open my license</Link> : <a className="button full" href="/api/auth/login">Continue with Whop</a>}
    <p className="note">Sign in using the same Whop account you used to purchase the indicator bundle.</p>
  </section></main>;
}
