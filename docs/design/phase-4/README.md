# Phase 4A review · version 1

Open the [gallery](../../../design-lab/arrival.html) with `Start-Process 'E:\ParkFair\design-lab\arrival.html'`. Choose a composition and appearance, then explore the resident screens and play the arrival sequence.

| Owner decision | Evidence |
| --- | --- |
| Allocation-first Loggia or garage-first Motor Court | [Loggia light](r1-light.png), [dark](r1-dark.png), [Motor Court light](r3-light.png), [dark](r3-dark.png) |
| Bay labels, entry and exit, plan zoom and accessible list | [Synthetic plan](plan.png). Actual society geometry is pending |
| Approve the five-stage A1 flow and chart sheet | [Review dossier](dossier.png). A missing assignment blocks confirmation |
| Typography and materials | Georgia display figures, system sans labels, pearl #F7F3EA, graphite #242823, brass #AD9570, stone #E9E5DC. Text-first navigation with proposed 16 px outline icons |
| Motion and quality | 220 ms entrance and 5 px vertical travel. Reduced motion opens directly. Eco still, Premium on-demand orbit, optional Ultra pending hardware evidence |

## 3D engineering study

The isolated model-viewer 4.1.0 experiment loaded a 5,422,412-byte CC0 vehicle GLB in desktop Chrome. It supports camera orbit, zoom, neutral environment lighting and a ground shadow. The car exercises clearcoat, transmission and sheen. [Actual render](material-study.png) · [Model, preview, authors and rights](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ToyCar) · [Production vehicle and environment shortlist with licensing routes](../phase-3/ASSETS_AND_REFERENCES.md).

Run the cached study in PowerShell and open http://127.0.0.1:8173 in a browser.

```powershell
Set-Location "$env:TEMP\parkfair-material-study"
python -m http.server 8173 --bind 127.0.0.1
```

To recreate the cache, copy the [study](../../../design-lab/material-study.html) to index.html in a temporary directory. Download ToyCar.glb from the linked model and save [model-viewer](https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js) as viewer.js alongside the HTML.

A WebView could host this study with its own graphics context. Expo GL would give the app direct resource and gesture management and requires separate testing of material extensions. Architectural lighting, compression trade-offs, native lifecycle, frame pacing and peak memory are pending. The decorative asset is independent of resident inventory.

## Parking policy proposal

Account access governs sessions and visibility. A society-approved entitlement could separately govern flat eligibility, exclusion reasons, effective dates and multi-vehicle priority. Policy changes require owner decisions on entitlements and migration.
The measured GLB contains 3 meshes, 3 materials, 8 textures and 108,936 indexed triangles. [Garage](garage.png) · [Mobile correction sheet](mobile-sheet.png).
