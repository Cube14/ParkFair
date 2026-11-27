# ParkFair native completion sprint

Baseline `67e8031043b6623590451bd6d5acf494d5a1b006`. All major visual changes use the development preview. Final design, media and production use require owner approval.

## 5D.7 — Parking Office

- The office shows dashboard occupancy, available capacity by area from active inventory and assignment counts, current dates and planned cycle status. The planning queue uses server coverage for its latest available draft. Management links lead to the actual directories.
- The dossier uses workbook column selectors, grouped row errors, registered correction values, a searchable chart and compact coverage. Validation, approval, idempotent publication, activation controls and simulated outbox status still use the original endpoints.
- Management supports flat creation and resident account creation, password reset and enable/disable. It also supports vehicle registration and activation, bay creation and cycle planning. Bay editing has no existing endpoint. Flat deletion, vehicle deletion and entitlement changes are outside this sprint.
- API 36 opened the office in both appearances and imported a synthetic CSV. Explicit column selection and grouping showed both invalid references on the same row. Registered selectors corrected the row, and review confirmed coverage after an explicit synthetic exclusion. The workflow opened the previous-revision comparison, approved revision 4, published version 1 and read one pending simulated notification. The backend replica-set Phase 2 and 3 checks passed (17/17). Mobile lint and typecheck passed.
- Checkpoint `af4f9d2`. [Office light](office-light.png) · [Office dark](office-dark.png) · [Grouped review issues](review-issues-light.png) · [Administrator walkthrough](administrator-walkthrough.mp4)

## 5D.8 — Synthetic architectural plan

- A native top-down drawing shows covered and outdoor bays, columns, circulation and sample bay A-12. It uses synthetic geometry and keeps sample selection distinct from account allocations. Owner-supplied site geometry remains required. The top-down view keeps bay labels readable at fit scale.
- API 36 verified zoom controls, drag at zoom, fit, map selection and the accessible list in both appearances. Mobile lint and typecheck passed.
- Checkpoint `ca8b504`. [Plan light](plan-light.png) · [Plan dark](plan-dark.png)

## 5D.9 — Resident library and garage controls

- The ledger distinguishes current, upcoming and past allocations and shows actual cycle, parking and vehicle details. Profile reads the resident's registered vehicle. Inbox, appearance, accessibility and device management share the editorial system. Device sign-out is confirmed and scoped to another known session on the signed-in account.
- Garage keeps the Phase 5D.5 lighting by default. The optional study uses brighter Studio Small 04 in light appearance and dimmer Studio Small 08 in dark. Reset and Eco stay prominent. Expandable credits remain accessible in Eco. Home uses the same baseline poster.
- API 36 verified schedule and history, profile, inbox, appearance, the current session, live lighting and restored baseline. The entrance used a 3.1-second reveal and the form was visible within about 4.3 seconds of opening the preview. Skip brought up the form within the 350 ms settling interval plus capture time. Removing only the renderer's ADB route exercised the compact sign-in fallback. The route was restored. Mobile lint and typecheck passed.
- Checkpoint `6d232f1`. [Schedule](schedule-light.png) · [Signed-in devices](devices-dark.png) · [Daylight study](garage-lighting-study-light.png) · [Evening study](garage-lighting-study-dark.png)

## 5D.10 — Android qualification and compact textures

The comparison used the same Android 36 emulator, camera, baseline lighting and orbit gesture. These are individual samples. App PSS excludes the separate WebView renderer process. The repeated baseline reached ready in 2.63 s, illustrating the timing variation on the emulator.

| Measurement | Baseline | Compact |
| --- | ---: | ---: |
| GLB bytes | 35,500,576 | 28,392,776 |
| Triangles | 656,073 | 656,073 |
| Concrete maps, decoded RGBA estimate before mipmaps | 64 MiB | 16 MiB |
| WebView navigation to ready | 3.90 s | 2.60 s |
| App-process PSS | 454 MiB | 451 MiB |
| Android median / p95 frame time | 40 / 101 ms | 29 / 36 ms |
| Janky frames | 13 / 48 | 3 / 69 |

The compact file changes four concrete maps and leaves the Porsche textures and all geometry byte-for-byte intact. Native stills preserve the silhouette, wheel detail and reflections at the matched view. Keep the approved baseline active. The compact renderer is an optional local evaluation. Eco remains available. Premium interactive is qualified on this Android emulator. Ultra remains experimental. [Baseline](garage-baseline.png) · [Compact](garage-compact.png) · [Source credits and licensing](../phase-5d.5/REVIEW.md)

- The isolated Android fixture activated published revision 4. The resident saw current covered bay A-12, upcoming C-03 and parking history. With Wi-Fi and mobile data temporarily disabled, Home kept the timestamped current allocation snapshot. Reconnecting restored live reads. [Home](motor-court-light.png) · [Offline snapshot](motor-court-offline.png)
- A second synthetic resident session was signed out through the native security screen. Its access token then returned 401 while the emulator session stayed signed in. Administrator and resident login, logout and role routing were exercised. A cold app process restored the resident session directly to A-12. Reduced motion bypassed arrival, keyboard Next focused the password field, and a wrong password showed the server's authentication error. Publication status remained simulated-only.
- On API 36 both renders could orbit, pinch to the 6.1 m stop and reset to 7.8 m. Route exit removed the WebView. Home button backgrounding initially kept a hidden WebView; after the visibility fix, the hidden document had no model-viewer element and the foreground resumed with Eco. The walkthrough shows the plan interactions and Home–Garage transition. [Resident walkthrough](resident-walkthrough.mp4)
- The isolated backend passed 32/32 tests. Mobile lint, TypeScript and the Expo dependency compatibility check passed. Local Android and iOS exports succeeded. The web build succeeded with existing chunk-size and `lottie-web` warnings. No physical iPhone validation or signing was performed.

## Resume and owner decisions

- Start the local stack with `Start-ParkFair.ps1`, then open **Open design preview** on Android. Start the renderer with `mobile/renderer-lab/Start-RendererLab.ps1` and use the existing staged assets. The baseline is selected when the script runs without flags.
- To rerun the texture study, with Pillow available run `compact_garage.py` with the staged `garage-brutalist.glb` as input and a separate `garage-brutalist-compact.glb` beside it as output. Run `Start-RendererLab.ps1 -CompactTextures`, then re-enter Garage. Restore the baseline by rerunning the launcher without the flag. Originals and local derivatives stay outside the committed preview sources.
- The four stage commits are local. Run `git log -4 --oneline` to list them, with **Qualify the Phase 5D.10 native preview** at the top after the final checkpoint.
- Owner review is still required for the native designs, alternate lighting and any promotion from preview. Actual site geometry, production rights review for the vehicle and other third-party scenery, and physical iPhone testing and signing remain outstanding.
