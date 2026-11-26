# Phase 5 native review

The prior Android app opened administrators directly into the dossier. I reproduced that entry point on the active fixture and confirmed that resident device controls were placed on Account. The existing layout also relied on the router's fallback tab marks and exposed photograph expansion as a garage action. The updated development build runs on the same API 36 emulator, Metro port 8082 and isolated HTTPS fixture.

## Android acceptance

| Screen or action | Result |
| --- | --- |
| Role sign-in and landing | Passed. Administrator reached Parking Office. Resident reached Motor Court with A-12 and upcoming C-03. [Overview](overview.png) · [Home](home.png) |
| Office directories | Opened Flats, Vehicles, Inventory and Cycles with live records. Added a synthetic flat, registered QA-V501 and added bay QA-B501 through the app. Created the synthetic resident account, reset its password, cancelled a disable prompt and then confirmed disabling it. Deactivated QA-V501 and verified the app offered reactivation. [Directory](directory.png) · [Resident account form](resident-management.png) |
| Allocation module | Opened separately from the office. Selected a planned cycle, created a draft, picked a workbook from Android Downloads, imported two rows and ran validation. The server identified invalid inventory and uncovered flats. Opened the chart and chose a registered bay. [Dossier](dossier.png) · [XLSX](xlsx-preview.png) · [Coverage](xlsx-coverage.png) · [Bay selector](bay-selector.png) |
| Activity | Opened the draft's server-backed activity from the dossier. [Activity](activity.png) |
| Resident garage, schedule and history | Traversed the custom bottom tabs, viewed the static garage and both date views. [Garage](garage.png) · [Schedule](schedule.png) · [History](history.png) |
| Appearance and account | Switched to dark mode and checked account, settings and signed-in devices. Current device is identified separately. [Account](account.png) · [Devices](devices.png) · [Dark home](home-dark.png) · [Resident recording](resident.mp4) |
| Native CSV, approved publication, activation and offline | Verified in Phase 4B on the same fixture. Full fresh Phase 5 passes still required, including concurrent revisions, keyboard and assistive technology. [Earlier native evidence](../phase-4/NATIVE.md) |

The existing server contract supports create and update operations for flats and vehicles, resident account creation, password reset and account status, bay creation, and draft-level audit. Native office coverage currently includes the tested directories and creation paths, vehicle status and resident-account operations, cycle planning in the dossier and publication-level communication status. Flat editing and deletion, vehicle details editing and deletion, inventory editing, and global audit and communications dashboards have no native UI in this checkpoint. Inventory update and removal lack a route in the current API. Society rotation beyond cycle planning and publication activation requires further native workflow work.

Web manual activation confirms the published sequence and sends the selected publication ID. Native activation requires that ID in its client contract and shows the sequence in the alert. The scheduled worker already checks the job's publication against the current publication inside its transaction. Legacy server callers retain the optional field for compatibility.

Local verification passed 32 backend tests and four mobile tests, mobile TypeScript and lint, both Expo exports, web lint and web production build. The Android app was left on Parking Office. The emulator, Metro and isolated HTTPS API were reachable after testing.

## Owner review

Review the actual Android captures for layout hierarchy and visual approval. The existing pearl, stone and dark palette frames the screens. Custom geometric tab icons and the revised screen hierarchy are available in development. Final editorial typography, bespoke motion, vehicle imagery and garage environment remain pending approval.

The app uses its labelled static garage photograph. The isolated CC0 sample and candidate licenses are documented in the prior checkpoint. The automated command to open the isolated renderer in emulator Chrome was rejected by approval review, so this pass has no Android 3D measurements, orbit or pinch evidence. A realistic production vehicle and architectural environment remain subject to selection, rights and native renderer qualification. [Prior desktop render and candidate checkpoint](../phase-4/FINAL_CHECKPOINT.md)
