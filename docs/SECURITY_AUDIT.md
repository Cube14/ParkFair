# Security audit

## Phase 2 controls

The API uses 15-minute JWTs and rotating, hashed refresh sessions. Replay revokes the whole family, and account revocation and audit writes commit together. Web refresh requires a Secure, HttpOnly, SameSite=Strict cookie, an explicit header and exact approved Origin. The browser keeps new access tokens in memory. Native uses SecureStore, with verification pending on hardware. Uploads have MIME, ZIP, XML and row limits. Immutable placements, transactional writes and explicit activation protect effective resident data. Real sends are disabled at the service boundary and provider dependencies were removed from the API. [Session details](PHASE_2_SESSIONS.md) | [Import and outbox limits](PHASE_2_ALLOCATION.md)

The Phase 1 sections below retain the historical findings and Atlas owner procedure.

## Baseline findings and Phase 1 controls

| Confirmed issue | Phase 1 response |
| --- | --- |
| Admin, notification and destructive endpoints were reachable without server roles. Resident account mutations accepted any signed token and targeted arbitrary user IDs. | Admin route groups require ADMIN and account edits require a resident target. Resident dashboard is scoped to the authenticated flat. Live DB role and account status are checked for protected requests. |
| Server logged the Mongo URI and login logged identifiers and hashes. Account creation serialized the user. Database errors and raw browser Axios errors could reveal data. | Removed sensitive logs, sanitized error responses, explicit user projection and password field exclusion. API responses use no-store. Legacy hardcoded diagnostic hash was replaced with a synthetic check. |
| Unrestricted CORS, missing login limits and permissive updates. | Explicit browser origin allowlist and body size/field/type validation. Twenty attempts per 15 minutes per IP, with current Express proxy trust left disabled. |
| Disabled WhatsApp initialized a browser and returned success while logging payloads. Generated WhatsApp cache was tracked. | Sending requires two explicit flags in deployment mode and is denied during development and tests. The browser initializes lazily. LocalAuth stays at its original path and cache copies remain on disk after untracking. |
| Seed/reset operations could act on the ordinary connection. | Admin and explicit loopback fixture mode required for reset. Seeds use a separate explicitly named local database. |

Access tokens newly issued here last one hour. Resident disable/reactivate and password reset increment the session version and revoke tokens. Versionless tokens from the earlier branch retain their original expiry unless the account version or signing secret changes. Browser localStorage remains a source of token exposure if the web origin suffers XSS. A per-IP in-memory limiter is appropriate for the local baseline. Plan layered throttling before a reverse proxy or multiple API instances.

## Threat model and release gates

| Boundary | Risk | Required next control |
| --- | --- | --- |
| Browser/mobile ? API | Account takeover, replay and XSS | Revocable rotating refresh sessions. Web HttpOnly, Secure cookies with CSRF controls and CSP. Mobile protected storage. Verify replay, theft, logout and proxy behavior. |
| Resident ? records | Cross-flat enumeration and excessive data exposure | Scope every history, schedule and notification read by server identity. Add negative object authorization cases to each endpoint. |
| Admin ? upload/publish | Malformed workbooks, formula injection, excessive files, unauthorized publication | Bound decompression and rows, validate signatures and sanitize formula-like exports. Enforce explicit approval and audit actor, revision and transition. |
| API ? DB and services | Secrets, privilege escalation, over-retention | Separate least-privilege users and audited secret injection. Apply HTTPS, narrowly restricted network access, redacted tracing and policy for retention/restore. |
| Device storage and release | Stolen device, stale personal data and signing compromise | Scope and purge the resident cache by account, protect signing credentials, and test device lock and offline expiry. |
| Notification provider | Duplicate/wrong sends, uncertain outcomes and sensitive previews | Use persistent outbox and audited approval, deduplicate publication jobs and reduce provider/exposed data. Keep live WhatsApp disabled pending advisory remediation and approved validation. |

Use the [OWASP API Security Top 10](https://owasp.org/API-Security/) and [OWASP MASVS](https://mas.owasp.org/MASVS/) as acceptance guidance. Direct dependency updates addressed identified Mongoose and Express advisory families. See [development status](DEVELOPMENT_STATUS.md) for remaining audit results.

## Atlas owner action

1. Open **Security ? Database Access** in the correct Atlas project. Identify the exposed DB user and create a replacement with a strong generated password, access limited to the ParkFair database and the target cluster.
2. Put the replacement connection string in the deployment secret store, validate readiness in an approved maintenance window and revoke the old user immediately. If compromise appears active, revoke first and handle downtime through the incident process. Review Atlas activity and available DB logs. Do not reuse the credential across development, staging and production.
3. Open **Security ? Network Access** and compare the client/host's egress IP to the project allowlist. Approve a narrow entry or use private connectivity. If TLS still fails with matching settings and a healthy cluster, compare from a second approved network and escalate with timestamps and sanitized diagnostics.
4. If a JWT signing key or account hashes were exposed, rotate signing material and reset affected passwords through approved administration. Treat historical copies and logs as part of the incident.

The credential-free probe resolved three SRV records and connected to all three over TCP. TLS 1.2 and 1.3 both failed on every node with `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`. No authenticated Atlas session was attempted. The exact cause remains open. [Atlas database users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/) ? [Atlas IP access lists](https://www.mongodb.com/docs/atlas/security/ip-access-list/)
