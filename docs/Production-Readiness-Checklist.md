# Production Readiness Checklist (Next.js + Express + Strava API)

## 1. Strava App Configuration
- [ ] Set Website URL in Strava API settings to your production URL.
- [ ] Set Authorization Callback Domain to production domain only (for example: ActivityOverlays.com, no scheme).
- [ ] Verify callback URL in app matches Strava settings exactly.
- [ ] Confirm app icon and app description are uploaded in Strava dashboard.

## 2. OAuth and Permissions
- [ ] Request minimum required scopes only.
- [ ] Use read-only scopes where possible (`read`, `activity:read`).
- [ ] Only request `activity:read_all` if private activities are truly required.
- [ ] Document each requested scope and why it is needed.
- [ ] Enforce CSRF protection with OAuth state validation.

## 3. Token Security
- [ ] Store refresh tokens encrypted at rest (DB encryption and/or KMS).
- [ ] Never expose refresh tokens to client-side code.
- [ ] Keep access tokens server-side only.
- [ ] Rotate and refresh access tokens before expiry.
- [ ] Revoke and delete tokens on user disconnect/deauthorization.
- [ ] Add audit logs for token creation, refresh, and revocation events.

## 4. API Rate Limits and Reliability
- [ ] Implement request throttling and retry backoff for Strava API calls.
- [ ] Respect Strava short-term and daily rate limits.
- [ ] Cache activity responses where appropriate to reduce API pressure.
- [ ] Add user-friendly error messaging for rate-limit events.
- [ ] Add monitoring/alerts for 401, 403, 429, and 5xx response spikes.

## 5. Security Hardening
- [ ] Enforce HTTPS in production.
- [ ] Use secure, httpOnly, sameSite cookies for session data.
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- [ ] Validate and sanitize all route and query params.
- [ ] Ensure all Strava data endpoints require authenticated user session.

## 6. Compliance and Legal
- [ ] Publish Privacy Policy at a public URL.
- [ ] Publish Terms of Service at a public URL.
- [ ] Include "Powered by Strava" attribution in the UI where required.
- [ ] Clarify app is not endorsed by Strava.
- [ ] Include account disconnect instructions in settings/help.

## 7. UX Requirements for Strava Review
- [ ] "Connect with Strava" button uses approved branding and links to OAuth flow.
- [ ] "Powered by Strava" attribution is visible and unmodified.
- [ ] Add a visible "Disconnect Strava" action in user settings.
- [ ] Confirm users can disconnect without contacting support.

## 8. Pre-Launch Validation
- [ ] Run lint/typecheck/build in CI.
- [ ] Test full OAuth flow on production domain.
- [ ] Test token refresh and expired token recovery.
- [ ] Test deauthorization flow end-to-end with DB token deletion.
- [ ] Verify PWA metadata/icons/manifest and mobile layout behavior.
- [ ] Verify robots/sitemap/metadata for public pages only.
