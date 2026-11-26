# ParkFair 2.0 master plan

Phase 3 implements local foundations and delivers the [isolated owner review](design/phase-3/REVIEW_PACKAGE.md) for visual decisions. Approved native implementation, asset clearance and hardware tests follow.

Phase 2 implements the allocation and secure session backend locally. The admin workflow is available through the API. Admin and resident design work remains proposal-only until explicit owner approval. [Phase 2 status](DEVELOPMENT_STATUS.md) | [Design register](design/APPROVAL_REGISTER.md)

The administrator owns parking decisions. ParkFair verifies, organizes, publishes and communicates them. An optional fairness recommendation explains capacity, priority and manual overrides.

| Phase | Work | Acceptance |
| --- | --- | --- |
| 1. Foundation | Secure the existing API, stabilize local runtime, preserve the web experience and add an Expo scaffold. | Synthetic verification covers roles, current-cycle selection, capacity, duplicate prevention, disabled notifications and probes. Record hardware and Atlas verification separately. |
| 2. Drafts and sessions | Build draft revisions, CSV/XLSX import, manual editing, validation, approval and publishing. Add revocable refresh sessions and versioned client contracts. | Import errors have actionable row references. Administrators can review and approve one revision, then retry publishing without duplicate records. A stolen or expired session can be revoked. |
| 3. Resident experience and delivery | Implement schedule, history, entitlement explanation, offline reads, native push and approved WhatsApp delivery. Port the existing motion and visual identity to Android first. | Residents see their own allocation and stale/offline states. Notification outcomes are durable and deduplicated. Motion, contrast, text scaling and navigation are qualified on devices. |
| 4. Release and operations | Qualify staging and rollback, restore verified backups, sign Android/iOS and instrument operational health. | Restore drill passes, production credentials are rotated, asset rights are verified, and release gates pass. |

## Administrator workflow

1. Select or create an upcoming cycle. Enter placements manually or upload Excel/CSV.
2. Normalize headers, identifiers and worksheet data. Preserve row provenance. Validate flats, active vehicles, ownership, duplicate rows, slot capacities, and missing or ambiguous references.
3. Preview the chart, correct invalid rows, compare revisions and review any recommended overrides.
4. Approve a specific revision. Publish using a unique cycle/revision key in one transaction that records assignments, approval, the active publication and outbox rows. Concurrent edits require review again.
5. Deliver only with approval. Expose delivery outcomes and retry after reconciling ambiguous provider responses. Retain revisions and the administrative audit trail.

## Fairness and code organization

Use covered days received versus ideal entitlement as the target. Track eligible days and real covered capacity, explain priority and deterministic ties, and record approved overrides. Preserve legacy ledger records and compare them in a read-only reconciliation before proposing a backfill. Keep the Express/MongoDB authority and separate web/native clients. Create a shared package when reusable API schemas have stable contracts. Keep local and deployment configuration in infrastructure and GitHub Actions.
