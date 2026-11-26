# Phase 3 engineering foundations

## Coverage and eligibility

Eligibility follows existing data rather than new parking policy. A flat is eligible when active, with at least one active vehicle assigned to it and no disabled resident account linked to it. An unregistered flat with an active vehicle remains eligible, matching Phase 2. Absence, guest passes, multiple cars, household priority and entitlements still need a society decision.

Coverage surfaces eligible and uniquely assigned flat counts, unassigned identifiers, explicit exclusions and reasons, validated assigned vehicles, unresolved references, and covered/outdoor total, occupied and available capacity. Only rows that resolve without a row error count toward coverage. An eligible omission is a validation issue until assigned or explicitly excluded with a reason. Invalid or duplicate exclusions and assigned-and-excluded conflicts also block approval. Edits create a new draft revision. Approval fingerprints include coverage and are rechecked when publishing. Inventory is checked again when activating a published version.

Assignment cardinality remains one active assignment per flat, per publication. The database also protects vehicle uniqueness. Multiple vehicles can exist in the inventory for one flat. Accepting multiple placements would need an explicit policy, a revised unique index, changes to grouped reporting, outbox recipient deduplication, import mapping, resident read contracts and a staged migration. None of those cardinality changes are required for the current workflow.

## API additions

| Route | Access and behavior |
| --- | --- |
| `GET /api/allocation-drafts/:draftId/coverage` | Admin. Recomputes coverage and issues for the current revision. |
| `POST /api/allocation-drafts`, `PUT /api/allocation-drafts/:draftId` | Admin. Optional `exclusions: [{flatNumber, reason}]`. Omitting exclusions on revision edits retains them, and an empty array clears them. |
| `POST /api/allocation-drafts/:draftId/import-preview` | Admin. Accepts the same bounded raw Excel/CSV upload. Returns detected column indices, labels, recognized or explicitly mapped fields, structural issues and row count without revising the draft. |
| `POST /api/allocation-drafts/:draftId/import` | Optional `X-ParkFair-Columns` JSON maps allowed fields to unique 1-based columns, for example `{"flatNumber":1,"slotNumber":2}`. Include the existing If-Match revision. Unrecognized headers are never used implicitly. |
| `POST /api/cycles/:id/activation-schedules` | Admin. `{publicationId,approved:true}` creates an intent for the latest planned publication. Repeat requests return the current pending intent. Midnight follows Asia/Kolkata. |
| `GET /api/cycles/:id/activation-schedules`, `DELETE /api/cycles/:id/activation-schedules/:jobId` | Admin. Inspect attempts and terminal status, or cancel a pending/retry job before activation. |
| `POST /api/resident/mock-push-installation` | Test only. Requires a native resident session and a synthetic installation/token. No external registration or send. |
| `GET /api/resident/inbox` | Resident. Account-scoped event identifiers and kind only; represented by synthetic events in local verification. |

The limited importer still accepts one worksheet, bounded ZIP/XML data, UTF-8 CSV and text Excel identifiers. Formulas, ambiguous automatic headers, stale revisions and unsafe file content use the existing validation paths. A representative society chart remains unavailable.

## Durable scheduled execution

The database stores a unique job per publication with approval actor/time, due time, status, retry count, failure category and next-attempt time. The isolated runner uses an injectable clock, executes the same fenced transaction as manual activation, checks the latest publication and approved actor, and commits activation, audit and job state together. Domain revalidation failures are recorded separately without committing partial activation. A fixed five-minute retry delay and three total attempts make test outcomes deterministic. A closed cycle or superseded publication stops execution. Owner-approved production scheduling still needs a deployed runner, operational ownership and alerts. The API starts no timer. The worker entry point is test-gated.

## Notification foundation and options

Synthetic installations are associated with a native refresh family. The stored synthetic token is hashed and expires with the family. Logout, password/account changes, replay and explicit revocation unlink registrations transactionally. The isolated mock requires an active administrator, selects the newest effective publication, suppresses superseded events, writes an account-scoped inbox record and commits outbox completion in the same transaction. It performs no network operation.

For a real provider use per-installation delivery records, durable leases, provider receipt reconciliation and explicit dispatch authorization. Store real provider tokens only in protected provider-ready storage. Keep payloads generic and route through authenticated deep links; resolve details only after current authorization. Treat permanent recipient failures and ambiguous submissions separately and cap retries. Use one durable idempotency key per delivery. Provider sends remain disabled.

Expo Push Service simplifies initial mediation and receipt handling while adding an external service and its credential lifecycle. Direct FCM/APNs offers finer provider control at the cost of two integrations, signing and more operational handling. Both need an approved development build and provider credentials. Meta's official WhatsApp Business Cloud API is a separate opt-in fallback candidate with template, consent, delivery webhook and cost review. [Expo push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/) · [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/about-the-platform)

## Mobile client and offline policy

The nonvisual typed client supports manual rows, import preview/mapping/upload, validation, coverage, revision comparison, approval, idempotent publication, activation/scheduling, resident schedule/history and owned sessions. The session transport refreshes the same account on 401 and uses account-specific query keys. The client provides invalidation hooks for later approved screen integration. The local TypeScript harness verifies the request shapes without platform dependencies.

SecureStore holds one resident snapshot containing bay/type and cycle name/dates plus owner, synchronization time and expiration. The cache API returns an explicit cached freshness state. Eviction occurs at 24 hours, account change, sign-out or observed access loss. The app requires a validated account before exposing any cached projection, so cold offline authentication is unavailable. Offline retries cannot reliably learn about server-side revocation until connectivity returns. Admin publishing remains network-only. The proposed cached UI is viewable in the isolated gallery. [Expo SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/)

## Migration and delivery

Add `ScheduledActivation` with unique publication and status/next-attempt indexes, `PushInstallation` with unique installation ID, session/user indexes and expiry TTL, and `ResidentInbox` with unique user/event and user/creation indexes. Revision/publication exclusions are additive. Existing publications remain readable. New activation revalidates coverage, so an old draft may need documented exclusions or a new publication before future activation. Follow the existing additive index procedure in isolated staging before real deployment.

Test CSP in report-only mode on the actual HTTPS reverse proxy with the existing Lottie and motion code. Inventory inline style, worker, image/media and connect requirements before enforcing directives. Preserve exact cookie origins, secure cookie transport, body limits and trusted proxy settings. Cross-site cookies and broad eval permissions are outside the approved baseline. [Previous migration procedure](PHASE_2_MIGRATION.md)
