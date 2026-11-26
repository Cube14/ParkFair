# API inventory

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

Current-cycle reads use ACTIVE status and inclusive Asia/Kolkata calendar dates. The latest start date, then ID, determines the result if active cycles overlap. Explicit notification selection can use an ACTIVE or PLANNED cycle. Preview and sends derive dates from the selected cycle. The server does not expose signup, email reset, user activation, refresh, history, publishing or push registration endpoints.
