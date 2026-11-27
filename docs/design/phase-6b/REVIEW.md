# Phase 6B Siddha-A review

[Light isometric view](siddha-light.png) · [Dark top-down view](siddha-dark.png) · [Android walkthrough](siddha-walkthrough.mp4)

The inventory distinguishes physical slots from parking addresses. `SLOT 1`, `2`, `5` and `6` take one classified Big car or two classified Small cars in A/B. Slots 3, 4, 7 and 8 and outdoor bays `OUT-1` through `OUT-4` each take one classified car. Full and split claims are mutually exclusive. The test-only `OUT-5` appears in the administrator test inventory. The ordinary inventory, allocation writers, resident reads, capacity, fairness and notification selection exclude it.

One transaction fence serializes competing allocation and inventory writes. Imports and corrections retain invalid rows for review and show their problems. Validation, approval, publication and activation recheck the same constraints. Activated and historical rows retain their published address. In the isolated fixture two Small cars hold `SLOT 1A` and `SLOT 1B` and a Big car holds `SLOT 2`. Effective capacity is 11 internal plus 4 outdoor, with 8 internal and 4 outdoor spaces available. Maximum capacity is 16.

## Verification

- 35 backend tests passed against the isolated replica set. New checks cover full/split races, duplicate and incompatible claims, OUT-5 role and read isolation, effective capacity, reversible inventory staging and CSV import through activation.
- Six mobile tests, lint and typecheck passed. Local Android and iOS bundle exports passed. The 3D viewport remains an Android development preview, with the 2D and list alternatives available on other platforms. A physical iPhone was not tested.
- On API 36, the resident saw current `SLOT 1A`, upcoming `OUT-2` and archived `SLOT 3`. The 2D, isometric, top-down and accessible list shared the same highlighted current address. Inspecting `OUT-2` left the current highlight in place. Orbit, pinch, pan, reset, appearance switching, the unavailable-renderer fallback and teardown on view exit and backgrounding were exercised.
- Android administrator review showed OUT-5 in its separate test inventory and the Small and Big classifications in Vehicles. Reopening the invalid draft showed the persisted full-slot conflict. The native selector corrected the Small car to `SLOT 1A`, and validation allowed the revised chart to proceed to approval.
- The study reuses the Phase 6A renderer and a shared JSON layout, generates a roughly 130 KB model and uses no vehicle assets or extra downloads.

## Cutover and assumptions

- The corrected sketch file was unavailable. The schematic follows the written placements and uses relative geometry. The proposed **A = inner** and **B = outer** convention and the layout need owner confirmation. No tandem access or vehicle movement policy has been assumed.
- `node backend/scripts/siddha-fixture.js up` stages the canonical addresses only against the explicitly selected local mobile fixture on the isolated replica set. `down` disables those addresses before any are referenced. It refuses after assignments exist. The migration preserves legacy records and refuses canonical-label collisions, which require a reviewed cutover mapping. Replacing old live or scheduled addresses requires a reviewed revision and explicit vehicle sizes.
- The API 36 emulator uses a separate Siddha-A fixture. The older development database remains intact. The local Siddha-A database name is saved in `siddha-database.txt` under the existing Phase 4B local state. To resume it, supply that name as `PARKFAIR_MOBILE_FIXTURE` to the existing `backend/scripts/mobile-dev.js` runner with the trusted certificate files. Use `mobile/renderer-lab/Start-RendererLab.ps1` to restage the preview.
- Domain checkpoint `ce9e72f`. The existing web client was outside native integration and its legacy forms lack Siddha-A size and tandem controls. Owner layout and visual approval remain pending. External sending stays disabled.
