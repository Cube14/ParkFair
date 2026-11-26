# Phase 2 allocation and publication

## Workflow

1. Create a planned cycle and create a draft. Input can be manual rows or a copy of the cycle's currently selected or staged assignments.
2. Replace the draft's chart with manual rows or upload CSV/XLSX. Every write carries the expected revision. Edits create immutable numbered revisions, return the draft to DRAFT and remove the previous approval. Compare exact row snapshots by line number.
3. Validate the current revision. Fix the issues identified by row, field, code and message. Validation checks controlled inventory, account eligibility, duplicates, capacity, inclusive dates and overlap with currently active or published cycles.
4. Approve the validated revision. The server rechecks inventory, dates and the cycle's publication head. If anything relevant changes before approval or publication, the saved review becomes stale and must be repeated.
5. Publish with an idempotency key. One transaction records the immutable publication, assignment snapshots, pending outbox entries, publication head, draft state and audit event. Same revision retries return the existing publication. A key used for a different revision returns a conflict. Published drafts are closed. Create a new draft to correct an allocation.
6. Activate explicitly when the cycle is date-effective in Asia/Kolkata. Activation revalidates the published placements, updates the active pointer and records the first activation. Publication alone never changes today's resident view. An approved replacement for an active cycle also needs activation. Overlapping active cycles are rejected. A database write fence serializes cycle and inventory decisions for the single society.

The existing assignment editor can still stage unpublished planned cycles before they have a draft. Clone preserves its old staging behavior. Copy those assignments into a draft, then validate, approve, publish and activate. Direct mutations of live, published, completed or draft-managed assignments return 409. Read contracts retain legacy active/completed allocations. This phase exposes administrator workflow through the API while the proposed screens await approval.

## Import contract

Use a UTF-8 CSV or an ordinary .xlsx workbook with one worksheet. Use row 1 for headers. The synthetic [Excel template](../backend/test/fixtures/allocation-template.xlsx) and [CSV template](../backend/test/fixtures/allocation-template.csv) illustrate the format. A representative society workbook was not present in the tracked workspace.

| Field | Header and normalization |
| --- | --- |
| Flat identifier | Required `flat_number` (aliases `flat`, `flat_no`). Text, including leading zeros. |
| Slot identifier | Required `slot_number` (aliases `slot`, `slot_no`). Text matched against configured slots. |
| Vehicle identifier | Optional `vehicle_number` (aliases `vehicle`, `vehicle_id`). Uppercased. A blank cell resolves only when the flat has exactly one active vehicle. |
| Notes | Optional `notes`, up to 500 characters. |

Headers are case-insensitive with spaces and hyphens mapped to underscores. Identifier values are trimmed and Unicode-normalized. Use Text cells in Excel for mapped values. Numeric XLSX IDs are flagged so a displayed zero-padded number cannot be silently changed. Blank chart rows are omitted, and CSV references are 1-based record numbers. The file is parsed in memory and released. Limits are 1 MB uploaded, 4 MiB expanded ZIP, 48 ZIP entries, one worksheet, 250 data rows and 16 columns. The reader bounds XML depth and record size, rejects active content, external relationships, merged cells and doctypes, and rejects formulas in the chart with row-level errors. Invalid workbook structures fail the upload. Exports quote cells and guard spreadsheet-formula prefixes.

Import uses raw file bytes with `Content-Type: text/csv` or the standard XLSX MIME type, `X-ParkFair-Filename` with the matching extension and `If-Match: "1"` using the current revision. All mutation routes require administrator authorization. [API inventory](API_INVENTORY.md)

The parser uses csv-parse, yauzl for bounded ZIP reads, and saxes for XML events. It extracts only the worksheet data needed by ParkFair and does not evaluate Excel content or extract files to disk. [csv-parse](https://csv.js.org/parse/) · [yauzl](https://github.com/thejoshwolfe/yauzl) · [saxes](https://github.com/lddubeau/saxes)

## Notification outbox and future dispatch

The event key includes the publication and flat. Jobs initially carry PENDING state, attempt count and next-attempt time, with no destination or raw import values. No production worker is started. The isolated mock supports atomic claims, bounded retries, provider outcomes and an ambiguous-delivery state.

A delivery worker must require separate dispatch approval, select eligible publications and ignore revisions superseded before dispatch. Resolve a current authorized destination at send time. Use a lease and idempotency key, persist provider outcomes and use exponential backoff with jitter for explicit retryable failures. If a worker loses its lease after submission or receives an uncertain result, place the event in AMBIGUOUS and reconcile provider status before resending. Keep contact data out of audit logs and outbox rows. Real WhatsApp or push delivery requires security review, approved provider credentials and device/account verification.

## Legacy fairness reconciliation

The read-only diagnostic joins completed unversioned physical assignments to legacy allocations by flat ID, vehicle ID and exact date window and checks that each legacy rotation reference exists. It checks legacy balance against outside minus inside rotation counts. On synthetic MongoDB data it found one physical row, two fairness rows, one parking-type mismatch, one unlinked fairness row and a consistent legacy ordinal score. All legacy rows were preserved.

A unified calculation needs a dated, activated assignment timeline with effective-from and effective-to boundaries, real eligible days and covered capacity, and a documented handling of changes and absences. Compute covered days received separately from entitlement days. Prefer published physical facts, review legacy matches before backfill, and expose a transparent comparison with assumptions. No fairness statistic is inferred from the synthetic reconciliation.
