# introverTrader ATAS License Portal

Next.js App Router portal for Whop OAuth sign-in and server-side Supabase license lookup.

## Important current limitation

The supplied Supabase `licenses` table only has `customer_email`; it does not contain a Whop user identifier. This starter therefore matches the **verified email returned by Whop OAuth** against `licenses.customer_email`. The lookup requires `email_verified === true` and refuses ambiguous duplicate matches. This is safer than trusting a `whop_user_id` query parameter, but it is an interim identity link. The recommended final design is to add a verified Whop user ID/member mapping to the license record and populate it from a verified Whop webhook/member relationship. Do not assume a webhook `member_id` is the same as OAuth `sub` without confirming the relationship from Whop data.

## 1. Whop setup

- App permission: `oauth:token_exchange`.
- OAuth scopes: `openid profile email`.
- Register exact redirect URIs:
  - `http://localhost:3000/api/auth/callback` (local development)
  - `https://portal-mocha-theta.vercel.app/api/auth/callback` (production deployment)
- Use the matching Client ID and Client Secret for the selected environment.
- `WHOP_SANDBOX=true` for Sandbox; `false` for Production.

The OAuth callback is implemented server-side. The client secret and Supabase service-role key must never be exposed to browser code.

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `WHOP_CLIENT_ID`
- `WHOP_CLIENT_SECRET`
- `WHOP_SANDBOX`
- `SESSION_SECRET` (at least 32 characters; generate using `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` (no trailing slash)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INDICATOR_DOWNLOAD_URL` (optional)

Add the same values to Vercel Project → Settings → Environment Variables. `NEXT_PUBLIC_APP_URL` should be `https://portal-mocha-theta.vercel.app` in Vercel.

## 3. Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## 4. Whop hosting paths

After deploying this Next.js app, set:

- Base URL: `https://portal-mocha-theta.vercel.app`
- Experience path: `/experiences/[experienceId]`
- Dashboard path: `/dashboard/[companyId]`
- Discover path: `/discover`

These paths are implemented in this project; they will only resolve after this project is deployed to the configured Base URL.

## 5. Supabase notes

The app uses the existing `public.licenses` columns:

- `license_key`
- `customer_email`
- `is_active`
- `expires_at`
- `created_at`

The service-role key is used only in server code. The app never sends it to the browser.

## 6. Embedded Whop testing

The OAuth flow follows Whop's official Next.js OAuth guide. Before relying on the Experience embed in production, test the entire sign-in/callback/return flow inside the actual Whop app. Embedded browsers can have stricter cookie behavior than a normal top-level browser tab. If the callback does not retain the session inside the embed, we should adjust the embedded authentication flow rather than weakening the license lookup.

## 7. Security and production hardening still required

- Verify that the actual Whop OAuth ID token signature and issuer/audience according to Whop's current OIDC/JWKS metadata. The starter checks the nonce and obtains the profile from the authenticated userinfo endpoint; nonce decoding alone is not a substitute for cryptographic JWT signature validation.
- Replace email matching with a verified Whop identity mapping once the webhook/member relationship is confirmed.
- Review webhook signature verification, idempotency, subscription cancellation timing, and license expiry logic separately. This portal does not change the existing webhook or database schema.
- Consider rate limiting and monitoring on authentication endpoints.
