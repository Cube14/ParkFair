# Phase 2 verification record

## Starting baseline

The working tree was clean on `feature/parkfair-2.0-foundation` at `df8f030265dd3b0a225b9f86ccb9ddf06e4a03e5`. The branch matched its remote. All Phase 1 files and commits remained in place. Node 24.14.1 and npm 11.11.0 ran the verification on Windows. Docker MongoDB 8 ran as an isolated temporary replica set.

| Baseline check | Result |
| --- | --- |
| Backend with isolated replica set | 15 tests, 15 passes, 0 failures, 0 skips. |
| Web build | Passed with the existing Vite chunk-size and Lottie eval warnings. |
| Browser smoke | Passed admin/resident sign-in, cycle clone, live resident assignment and revoked-account redirect. |
| Docker API | Build and readiness against isolated MongoDB passed. |
| Mobile | Lint, type check, Expo compatibility and all 20 Expo Doctor checks passed. |
| Web lint backlog | 41 errors and 2 warnings. |

## Phase 2 evidence

| Check | Result |
| --- | --- |
| `npm test --prefix backend` with PARKFAIR_TEST_MONGO_PORT | **26 tests, 26 passed, 0 failed, 0 skipped.** The rollback test deliberately injects a Mongo write error and verifies that the publication, assignments and outbox roll back. |
| `npm run lint --prefix frontend` | Exit 0, 0 errors and 0 warnings. ESLint rules unchanged. |
| `npm run build --prefix frontend` | Exit 0. Existing chunk-size and Lottie eval warnings remain. |
| Headless Chrome with synthetic data | Admin and resident sign-in, clone, live assignment and both resident videos, HttpOnly/Secure/Strict cookie, reload restoration, no localStorage access token, resident disable and login redirect. No page errors. |
| Docker image and readiness | Image builds without a WhatsApp browser runtime. Non-root API reported ready against isolated MongoDB. |
| Mobile lint and TypeScript | Both passed. |
| `npx expo install --check` and `npx expo-doctor` | Compatible, 20/20 checks passed. |
| `npx expo export --platform all` | Android and iOS Hermes bundles exported, approximately 2.6 MB each. |
| Fresh npm audits | Backend, frontend and mobile each reported 0 advisories. |
| Design previews | Generated both isolated previews in Chrome and confirmed the HTML fits a 390 px viewport. The app does not reference those files. |

The test suite covers CSV/XLSX shape and bounds, zero-preserving identifiers, formula handling/export, admin-only import, structured errors, inventory change detection, duplicate/capacity/ownership failures, revision conflicts, approval, idempotency, future activation isolation, concurrency across overlapping cycles, rollback, outbox handling, resident reads, secure cookies, refresh replay and expiry, revocation and disabled live delivery.

## Files and dependency changes

- **Created** allocation and auth session models. Added draft routes, import/archive validation, publication service, shared parking write fence, resident schedule/history controller, assignment visibility, mock outbox, session transport, replay-aware token services and read-only legacy reconciliation. Added synthetic CSV, valid XLSX and invalid XLSX fixtures, and the Phase 2 replica-set test suite.
- **Modified** existing backend model/query/controller paths for versioned placement, activation, eligibility, authentication and legacy protection. Updated web Auth/Theme/Cycle contexts, request hooks and session services while preserving existing visual presentation. Updated the mobile SecureStore client, runtime environment example, Docker packaging and CI. The original media and animation assets remain intact.
- **Added** csv-parse 7.0.3, yauzl 3.4.0 and saxes 6.0.0. **Removed** whatsapp-web.js, Puppeteer and qrcode-terminal from the API package and its container. The original LocalAuth directory was left in place. Scoped minimatch 11.0.9 overrides address the reported advisories through Expo fingerprint and Nodemon. No SDK downgrade was used. [Import architecture](PHASE_2_ALLOCATION.md)
- **Created** the [approval policy](design/DESIGN_APPROVAL_POLICY.md), [register](design/APPROVAL_REGISTER.md), [concept previews](design/PHASE_2_CONCEPTS.md), and dedicated [migration](PHASE_2_MIGRATION.md) and [session](PHASE_2_SESSIONS.md) guides. Updated the existing engineering documents.

## Verification boundaries

GitHub-hosted CI, native device sessions and release signing remain unverified. No production Atlas access was performed. The Phase 1 TLS failure and exposed credential remain owner items. There was no real notification delivery. The synthetic workbook is an import example rather than a match for the society's actual layout or spreadsheet. The administration API is ready for local review and the new screens await design approval.
