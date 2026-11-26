# Phase 2 sessions

Access JWTs are signed with the existing HS256 key, expire after 15 minutes and carry the current account version. Updated clients also receive a session-family ID. Each protected request verifies the current account role, account status and account version and, for new tokens, live family state and expiry.

Web login, refresh and logout require the `X-ParkFair-Session: web` header and an exact allowed Origin. Refresh credentials are set only in a Secure, HttpOnly, SameSite=Strict host-scoped cookie. The browser keeps new access tokens in memory and uses one refresh operation per tab. When Web Locks is available, login, refresh and logout also serialize across same-origin tabs. Use a same-site HTTPS deployment with configured `WEB_ORIGINS`. Local browser origin setup is in [DevOps](DEVOPS_PLAN.md).

Mobile login, refresh and logout use the `native` header without browser Origin. They send refresh credentials in a TLS-protected body, store only that refresh token in SecureStore and keep the access token in memory. The app rotates the refresh credential before restoring a session and retries a failed authorized read after refresh. Query data is cleared on sign-out. SecureStore behavior is pending device validation.

Refresh secrets are generated from 256 bits of randomness and only their SHA-256 hashes are stored. Consumption and replacement are atomic. Presented used tokens revoke the whole family, including a winning token from a concurrent replay. The 30-day family lifetime is absolute. Expired sessions are refused immediately and MongoDB TTL removes expired families and token hashes. If a successful rotation response is lost, reuse may revoke the family and require sign-in again. This avoids accepting a replay during a grace period.

Authenticated users can list and revoke their own sessions. Password reset and account toggles revoke all resident sessions in the same account transaction. Audit records contain IDs, dates, reasons and counts. There are no authentication secrets in audit records.

## Compatibility and rollout

Versionless and sessionless legacy JWTs retain their signed expiry and existing account-version checks. They cannot be exchanged for a refresh credential. A request without a session transport header still gets a 15-minute bearer token during migration. Legacy clients should sign in using the new transport to get rotation. The browser can use its stored Phase 1 bearer until it expires and removes old storage on a successful new session or revocation. Native legacy storage is cleared when restoration completes. A global signing-key rotation remains available to invalidate legacy JWTs, subject to owner approval.

Verify same-site HTTPS, Origin and reverse-proxy settings in staging and confirm rotation and sign-out on real mobile devices. Future work includes a distributed login limiter for scaled deployments, CSP rollout for the web origin and session/device UX after design approval. [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) · [Expo SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/)
