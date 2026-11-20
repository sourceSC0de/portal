# introverTrader ATAS License Portal

Next.js App Router portal for Whop OAuth sign-in and server-side Supabase license lookup.

## Identity and license mapping

The existing Whop payment webhook populates `public.licenses.whop_user_id` after verifying the payment and membership via the Whop API. The portal now looks up the license **only** by the authenticated Whop OAuth user ID (`userinfo.sub`). It never trusts user-supplied email addresses, query parameters, or unsigned IDs.

**Before rollout:** confirm that production Whop `userinfo.sub` is exactly the `user_...` identifier saved by the webhook for the same test buyer. If those identifiers differ, stop and reconcile them server-side; do not use email matching as a shortcut.

If a Whop user has more than one license record, the portal fails closed and asks them to contact support.

## Whop setup

- OAuth permission: `oauth:token_exchange`.
- Scopes: `openid profile email`.
- Redirect URI: `https://portal-mocha-theta.vercel.app/api/auth/callback`.
- Use `WHOP_SANDBOX=false` with production credentials.
- Whop app base URL: `https://portal-mocha-theta.vercel.app`.
- Experience path: `/experiences/[experienceId]`.
- Dashboard path: `/dashboard/[companyId]`.
- Discover path: `/discover`.

These Whop routes are already implemented and display the same license portal.

## Vercel environment variables

Copy `.env.example` to `.env.local` for local development and configure the same values in Vercel:

- `WHOP_CLIENT_ID`
- `WHOP_CLIENT_SECRET`
- `WHOP_SANDBOX` (`false` in production)
- `SESSION_SECRET` (at least 32 characters)
- `APP_URL` (`https://portal-mocha-theta.vercel.app`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `INDICATOR_DOWNLOAD_URL` (optional)

**Never commit secrets or put Supabase service-role credentials in `NEXT_PUBLIC_*` variables.**

## Build locally

```bash
npm install
npm run build
```

## Release checks

1. Confirm the Vercel project deploys from this repository and the intended branch.
2. Confirm Whop OAuth redirects to the configured callback and the buyer stays signed in when opening the experience iframe.
3. Confirm `userinfo.sub` matches `public.licenses.whop_user_id` for the same buyer.
4. Confirm buyer A sees only buyer A's license; buyer B or an unauthenticated visitor must never receive it.
5. Confirm inactive or expired licenses display the proper status.
6. Confirm no Supabase service-role key, OAuth client secret, or raw session token appears in the browser response or logs.

## Remaining production security work

- The existing callback reads the JWT payload to check the nonce but does **not** cryptographically verify the ID token signature. Validate tokens against Whop's current OIDC issuer/JWKS/audience before treating the login flow as fully production-hardened.
- The existing OAuth cookie/session flow needs an end-to-end test in Whop's embedded iframe, as browser cookie restrictions can differ from top-level navigation.
- The portal does **not** send Resend emails; that integration belongs in a separately idempotent fulfillment process after successful payment.
- Refund and chargeback automation should remain disabled until verified against actual Whop data.

## Embedded Whop login (no second button)

The Whop Experience and Company Dashboard views now use `@whop/sdk@0.0.3` to verify the `x-whop-user-token` header server-side, based on Whop's official Next.js app template. After verification, the portal queries Supabase `licenses.whop_user_id` for that exact Whop account. There is no URL/email-based fallback. Visiting an embedded route directly (without a verified header) fails closed.

Set `WHOP_API_KEY` (Whop App API key) in **Vercel Production** as a **Secret**, separate from `WHOP_CLIENT_SECRET` and from Supabase keys. The standalone homepage and `/dashboard` still use the existing OAuth sign-in.

**Before merge:** verify the pinned SDK exposes `verifyUserToken` in the installed package/build; test within the actual Whop iframe. This repository cannot validate the SDK/build or deployment automatically here. The currently deployed OAuth callback still needs proper JWT signature verification before relying on it as a production-grade login. Always test that the Whop embedded user ID matches the `user_...` ID stored on the correct license.

