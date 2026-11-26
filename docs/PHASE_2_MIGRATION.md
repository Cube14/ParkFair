# Phase 2 migration and index review

## Deployment order

1. Resolve Atlas connectivity and rotate the exposed database credential using the existing [owner steps](SECURITY_AUDIT.md). Confirm staged isolation and writable replica-set topology with certificate verification enabled.
2. Take and verify a restorable backup. In approved isolated staging, inventory cycle date overlaps, orphan references and assignment duplicates. Identify the named current legacy cycle via administrator review. Keep existing cycles, assignments and Rotation/Allocation/CreditLedger records as-is. No backfill is required for the optional publication pointers or session fence.
3. Using approved migration credentials with DDL permissions, precreate new collections and apply the additive indexes below. Generate proposed definitions from the Mongoose schemas and compare with current indexes. Use explicit `createCollection` (already-exists is acceptable) and `createIndexes` operations. Avoid `syncIndexes`, which can remove indexes. Check duplicate keys first and stop on disagreement with the reviewed plan. The normal production account does not need migration permissions.
4. Launch API in staging with exact `WEB_ORIGINS`, HTTPS and the existing secret migration policy. Deploy the web client with the API and validate cookie rotation from the real browser origin, including the access proxy. Confirm old bearer tokens still expire normally and force sign-in where needed. Native development builds require separate device tests.
5. Rehearse the first activation from a reviewed staging revision, check audit/outbox uniqueness and resident isolation, and verify rollback using a known compatible snapshot. Once publications exist, a Phase 1 backend can read all placement versions indiscriminately. Roll back to a build that understands Phase 2 or restore a reviewed pre-publication snapshot in an approved maintenance window.

## Required collections and indexes

Model names below use their configured Mongoose collections. Existing username, cycle, slot, vehicle and ledger uniqueness remains in force.

| Model | Additive index |
| --- | --- |
| AllocationDraft | `cycleId, updatedAt DESC` |
| AllocationRevision | Unique `draftId, revision` |
| AllocationPublication | Unique `draftId, revision`, unique `key`, unique `cycleId, sequence` |
| AdminAudit | `entityId, createdAt DESC, _id DESC` |
| NotificationOutbox | Unique `eventId`, and `state, nextAttemptAt` |
| ParkingWriteFence | Built-in unique `_id`. Singleton `parking` is initialized with an idempotent upsert. |
| ParkingAssignment | `cycleId, publicationId, assignmentStatus`. Partial unique `publicationId, flatId` and `publicationId, vehicleId` apply only to ObjectId publication references. |
| AuthSession | `userId, revokedAt`; TTL on `expiresAt` |
| RefreshToken | Built-in unique hash `_id`; TTL on `expiresAt` |

Confirm all unique and TTL indexes in staging before publication/auth sessions are used. Request-time expiry checking applies even before TTL cleanup runs. Creation and updates that affect inventory, effective cycles or placement use the same single-society pessimistic write fence. All participating services and tools must use that contract or execute only during an approved maintenance window. Database operators should investigate existing duplicate active cycles before cutover. Normal activation refuses to displace a different date-effective cycle.

This procedure was designed and exercised with local fixture collections. No production Atlas migration, data read, credential change or allowlist update was performed. [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/)
