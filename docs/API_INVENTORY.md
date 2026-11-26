# API inventory

Phase 2 routes are listed below. Session and publication rules supersede the Phase 1 behavior where indicated.

Except for the identity route, paths in the table are under `/api`. Protected requests use `Authorization: Bearer <access token>`. Errors carry `{success:false,message}` and can include a machine code. Typical errors are 400 invalid input, 401 missing/expired token, 403 disallowed role or disabled account, 404 missing record, 409 conflict, 413 excessive payload, 429 rate limit and 503 unavailable integration.

| Access | Route | Input and success |
| --- | --- | --- |
| Public | `GET /` (root) | Service identity. |
| Public | `GET /health` | `{success:true,status:"ok"}` liveness. |
| Public | `GET /health/ready` | `{success:true,status:"ready"}` if a writable replica-set primary or sharded cluster can respond. Otherwise 503. |
| Public | `POST /auth/login` | `identifier,password`, username or flat number ? `success,token,user`. |
| Signed in | `GET /auth/me` | `success,user`. Public user has `id,_id,username,role,flat,flatId,isActive`; populated flat has ID, number and owner name. |
| Admin | `POST /auth/resident` | `flatId,password` ? 201 + public user. Password ?8 characters and ?72 UTF-8 bytes. |
| Admin | `PUT /auth/resident/:id/password` | `password` ? `success` and revocation. |
| Admin | `PUT /auth/resident/:id/toggle` | No body ? `success,isActive`. Legacy non-idempotent toggle. |
| Resident | `GET /resident/dashboard` | Own `resident{name,flatNumber}`, nullable `vehicle{id,number,type}`, `parking{status,slot,side}`, `cycle{id,name,startDate,endDate,remainingDays}`. |
| Admin | `GET /flats` | Raw list with contact fields, vehicle count and resident account summary. |
| Admin | `GET /flats/test` | Legacy availability response. |
| Admin | `GET /flats/:flatId/history` | `success,flatNumber,history` with cycle, slot, parking type and status. |
| Admin | `POST /flats`, `PUT /flats/:id` | Create requires `flatNumber`. Owner, contact, email, wing, floor, registration and activity allowed. Returns `success,data`. |
| Admin | `DELETE /flats/:id` | Deletes an unlinked flat ? `success,message`. |
| Admin | `GET /vehicles` | `success,count,data` with populated flat ID, number and owner. |
| Admin | `POST /vehicles`, `PUT /vehicles/:id` | Create needs `vehicleNumber,flatId`, optional `vehicleType`. Edit also accepts `isActive`; history constrains flat changes. Returns `success,data`. |
| Admin | `DELETE /vehicles/:id` | Deletes an unlinked vehicle ? `success,message`. |
| Admin | `GET /slots` | `success,count,data` slot listing. |
| Admin | `POST /slots` | `slotNumber,side,displayOrder`. Optional `maxCapacity,slotType,isActive`. Returns 201 + `success,data`. |
| Admin | `GET /cycles` | `success,count,data`, ordered by start date. |
| Admin | `POST /cycles` | `cycleName,startDate,endDate,durationDays`, optional status. Date-only or UTC ISO dates. Returns 201 + `success,data`. |
| Admin | `PUT /cycles/:id/status` | `status`: PLANNED, ACTIVE or COMPLETED ? `success,message,data`. |
| Admin | `PUT /cycles/:id/complete` | Sets completed ? `success,message,data`. |
| Admin | `DELETE /cycles/:id` | Deletes a cycle without assignment history ? `success,message`. |
| Admin | `POST /cycles/:cycleId/clone` | Source ID plus new cycle name/dates/duration ? 201 + `success,message,sourceCycle,newCycle,assignmentsCopied`. |
| Admin | `GET /cycles/:cycleId/matrix` | `success,cycle,data,capacity`, with flat numbers and available configured capacity grouped by slot. |
| Admin | `GET /cycles/:cycleId/summary` | `success,data` with cycle metadata, assignment counts, flat lists and covered occupancy percentage as a decimal string. |
| Admin | `GET /layouts/:cycleId` | Physical layout and assigned flats grouped by slot. |
| Admin | `GET /assignments` | `success,count,data` with populated flat, cycle, slot and vehicle identifiers. |
| Admin | `POST /assignments` | `cycleId,slotId,flatId,vehicleId`, optional `notes,parkingType`. Slot metadata determines stored type. Returns 201 + `success,data`. |
| Admin | `POST /assignments/bulk` | `cycleId,assignments:[{slotNumber,flatNumber}]` with 1?250 rows and all-or-nothing commit. Returns 201 + `success,count,data`. |
| Admin | `PUT /assignments/:id` | `slotId` ? `success,message,data`. |
| Admin | `DELETE /assignments/:id` | Removes one assignment ? `success,message`. |
| Admin + fixture mode | `DELETE /assignments/reset` | Disabled by default. Explicit local fixture mode can delete all assignments. |
| Admin | `GET /dashboard` | `success,data` with total counts, current cycle, inside and outside assignments, capacity, occupancy and recent activity. |
| Admin | `POST /allocations/generate` | Generates legacy rotation 1 ? 201 + rotation ID/number and inside/outside counts. Duplicate attempt returns 409. |
| Admin | `GET /allocations/all`, `GET /allocations/rotations`, `GET /allocations/ledgers` | Raw arrays for the corresponding fairness entities. |
| Admin + fixture mode | `DELETE /allocations/reset` | Disabled by default. Explicit fixture mode can reset legacy fairness collections atomically. |
| Admin | `GET /notifications/preview` | Optional `cycleId` ? `success,cycleId,total,data,errors`. Recipient details and rendered text are private to admin. |
| Admin + approval | `POST /notifications/send-active` | Optional `cycleId` ? cycle, total, sent, failed and safe errors. |
| Admin + approval | `POST /notifications/single` | `flatNumber` and optional `cycleId` ? send outcome for the selected flat. |
| Admin + approval | `POST /notifications/test` | `phone` ? test message outcome. Sending routes return 503 while disabled. |

Current-cycle reads use ACTIVE status and inclusive Asia/Kolkata calendar dates. The latest start date, then ID, determines the result if active cycles overlap. Explicit notification selection can use an ACTIVE or PLANNED cycle. Preview and sends derive dates from the selected cycle. The server does not expose self-service signup, email reset, user activation or push registration endpoints.


## Phase 2 additions

Paths below use the same /api prefix. All draft and publication routes require ADMIN. IDs use the existing MongoDB ID format.

| Route | Contract |
| --- | --- |
| `POST /allocation-drafts` | `{cycleId,rows?}` or `{cycleId,copyAssignments:true}`. Returns 201 with draft and revision 1. |
| `GET /allocation-drafts?cycleId=` | List draft heads, optionally scoped to a cycle. |
| `GET /allocation-drafts/:draftId` | Draft head, current immutable version and validation state. |
| `PUT /allocation-drafts/:draftId` | `{revision,rows}` replaces the full draft chart as a fresh immutable version. |
| `POST /allocation-drafts/:draftId/import` | Raw CSV/XLSX, matching Content-Type and X-ParkFair-Filename, numeric revision in If-Match. Returns 201 with revision and import issues. |
| `GET /allocation-drafts/:draftId/revisions/:revision` | Read a specific immutable version. |
| `GET /allocation-drafts/:draftId/compare?from=1&to=2` | Row-level previous/current snapshots for differences. |
| `GET /allocation-drafts/:draftId/export.csv` | Latest chart with spreadsheet-formula prefixes escaped. |
| `POST /allocation-drafts/:draftId/validate`, `/approve`, `/cancel` | `{revision}`. Validation returns structured issues. Stale review or state returns 409. |
| `POST /allocation-drafts/:draftId/publish` | `{revision}` and Idempotency-Key. Returns 201 for a new publication and 200 for an already-published revision. Returns 409 on stale approval or wrongly reused keys. |
| `GET /allocation-drafts/publications/:cycleId` | Up to 100 publication records for the cycle. |
| `GET /allocation-drafts/publications/:cycleId/:publicationId` | One publication and its immutable assignment snapshots. |
| `GET /allocation-drafts/audit/:entityId` | Up to 100 recent append-only events for an entity. |
| `GET /resident/schedule` | `{current,next,upcoming}` visible to the authenticated flat only. |
| `GET /resident/history` | `{history}` of completed legacy, replaced legacy and previously effective published parking. |
| `POST /auth/login` | Existing credentials. Web transport issues HttpOnly refresh cookie, native transport returns refresh token. Legacy bearer-only clients remain supported. |
| `POST /auth/refresh`, `POST /auth/logout` | Client transport marker required. Web uses the refresh cookie plus exact approved Origin. Native body contains refreshToken and browser Origin is refused. |
| `GET /auth/sessions`, `DELETE /auth/sessions/:id` | List or revoke an owned session. |
| `PUT /cycles/:id/status` | ACTIVE requires a date-effective publication, except repeated activation of an already active legacy cycle. Future publication is visible to resident schedule without activation. |
| `POST, PUT, DELETE /assignments`, including bulk | Write only unpublished planned staging without an allocation draft. Effective and versioned assignments are protected. |
| `POST /notifications/test`, `/single`, `/send-active` | Always 503 in the Phase 2 API. Preview remains available. |

[Import and publication details](PHASE_2_ALLOCATION.md) | [Session details](PHASE_2_SESSIONS.md)

## Phase 3 additions

See the [coverage, upload mapping, scheduling and mock notification API contracts](PHASE_3_ENGINEERING.md#api-additions).
