# Phase 5D.1 palette and garage correction

[Home light](home-light.png) · [Home dark](home-dark.png) · [Garage light](garage-light.png) · [Garage dark](garage-dark.png)

Home places the current and upcoming allocation beside an unobstructed vehicle photograph. Garage has a dedicated viewport and frames the full photograph. The resident preview uses the approved Phase 5B tokens. The existing model-viewer garage page is prepared for an authorized Porsche GLB and preserves orbit, pinch and reset. The ToyCar entry remains an isolated developer diagnostic.

**Selected model for evaluation.** Sketchfab identifies the Porsche 911 Carrera 4S as downloadable, credits Lionsharp Studios (`lionsharp`), and lists CC BY-SA 4.0. The license covers the model copyright under its attribution and ShareAlike terms. Porsche trademark and other third-party rights are outside that license. Confirm the relevant branded-use rights before distributing the model to residents. The download API returned HTTP 401 without an authenticated Sketchfab account. [Model and download](https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf) · [CC BY-SA 4.0 terms](https://creativecommons.org/licenses/by-sa/4.0/legalcode)

Sign into Sketchfab, open the listing, select **Download 3D Model** and choose **GLB**. Extract the self-contained `.glb` if it arrives in a ZIP. For authorized local evaluation, stage it with:

```powershell
& 'E:\ParkFair\mobile\renderer-lab\Start-RendererLab.ps1' -PorscheGlb 'C:\path\to\porsche.glb'
```

Return to the Garage tab to pick up the asset. The four Android captures show the photo fallback. The Porsche framing and gestures remain unverified until the real GLB is available.

Mobile lint, TypeScript and all four tests passed. The API 36 emulator displayed live current bay A-12, upcoming bay C-03 and the registered vehicle in both appearances.
