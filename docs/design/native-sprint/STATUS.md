# ParkFair native completion sprint

Baseline `67e8031043b6623590451bd6d5acf494d5a1b006`. All major visual changes use the development preview. Final design, media and production use require owner approval.

## 5D.7 — Parking Office

- The office shows dashboard occupancy, available capacity by area from active inventory and assignment counts, current dates and planned cycle status. The planning queue uses server coverage for its latest available draft. Management links lead to the actual directories.
- The dossier uses workbook column selectors, grouped row errors, registered correction values, a searchable chart and compact coverage. Validation, approval, idempotent publication, activation controls and simulated outbox status still use the original endpoints.
- Management supports flat creation and resident account creation, password reset and enable/disable. It also supports vehicle registration and activation, bay creation and cycle planning. Bay editing has no existing endpoint. Flat deletion, vehicle deletion and entitlement changes are outside this sprint.
- API 36 opened the office in both appearances and imported a synthetic CSV. Explicit column selection and grouping showed both invalid references on the same row. Registered selectors corrected the row, and review confirmed coverage after an explicit synthetic exclusion. The workflow opened the previous-revision comparison, approved revision 4, published version 1 and read one pending simulated notification. The backend replica-set Phase 2 and 3 checks passed (17/17). Mobile lint and typecheck passed.
- [Office light](office-light.png) · [Office dark](office-dark.png) · [Grouped review issues](review-issues-light.png)
