# Phase 6A architectural parking study

On the Android development preview, open **Motor Court → Parking plan → 3D study**. The 2D drawing opens first. The drawing, 3D study and accessible bay list share selection. A-12 is the default sample in the study. Motor Court continues to show live allocations independently.

[Light isometric view](study-light.png) · [Dark top-down view](study-dark.png) · [Android walkthrough](study-walkthrough.mp4)

## Architecture

`mobile/src/data/parkingStudy.json` holds the synthetic bay identifiers, section boundaries, column grid and cutaway roof strips. The native 2D plan reads the JSON directly. `Start-RendererLab.ps1` stages the same JSON and the study scripts on the existing loopback server. The WebView generates a small GLB in memory, then uses the existing model-viewer for the camera, soft contact shadow and picking. The viewport loads no Porsche, Brutalist garage, external asset or texture. Scene colours derive from the locked light and dark palette.

The WebView releases the model on backgrounding and returns to the 2D drawing. Switching away unmounts the WebView. Missing renderer data returns the user to the 2D drawing and accessible list after a bounded wait.

## API 36 measurements

| Measure | Observation |
| --- | --- |
| Scene | 17 marked bays, 1,875 triangles, about 150 KB generated GLB |
| Navigation to renderer ready | 0.84 s light, 0.73 s dark |
| One native orbit | 91 app frames, 34 ms median, 48 ms p95, 16 janky frames |
| App-process PSS snapshots | 424 MiB on the 2D drawing and 410 MiB in one 3D sample |
| WebView renderer sandbox PSS | 100 MiB in a separate active sample |

The PSS observations are separate emulator snapshots and vary with process state. They do not establish an incremental memory delta. Frame timing measures Android app presentation.

Verified native bay selection, shared selection in the list, top-down and isometric presets, orbit, pinch, pan, reset, 2D switching, and both appearances. Reduced motion jumped immediately to the chosen preset. The model element was gone when the app was backgrounded, and the 2D drawing resumed in the foreground. Temporarily removing the renderer's ADB route also returned to the 2D plan. Returning to Motor Court showed current A-12 and upcoming C-03 from the isolated backend. Mobile lint and typecheck passed.

The isometric preset uses an architectural perspective and the roof is cut away to reveal the bays. Study geometry, labels and circulation are illustrative. Real site drawings, visual approval and physical-device qualification remain open.
