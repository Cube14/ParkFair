# Phase 5D.5 architectural garage

The local Android development preview uses **Brutalist Interior with Studio Small 04**. Its concrete joints and lit corners give the Porsche a clear floor and depth as the camera moves. The showroom rendered successfully but its brighter staircase competes with the car and adds 107,579 triangles. Studio Small 08 produced a flatter reflection along the doors and a cooler windshield. The locked Phase 5B tokens and serif typography are preserved.

| Native evidence | Captures |
| --- | --- |
| Environment comparison, same camera and HDRI | [Brutalist](candidate-brutalist.png) · [Showroom](candidate-showroom.png) |
| Alternate lighting on the concrete scene | [Studio Small 08](lighting-alternate-08.png) |
| Selected garage | [Light](garage-light.png) · [Dark](garage-dark.png) |
| Matching Home poster and live allocation | [Light](home-light.png) · [Dark](home-dark.png) |
| Navigation, reveal and orbit | [Android recording](home-garage-orbit.mp4) |

## Assets and modifications

| Asset | Source bytes | Triangles | Structure |
| --- | ---: | ---: | --- |
| Porsche 911 Carrera 4S | 25,358,212 | 652,660 | 45 meshes, 14 materials, 10 PNGs |
| Brutalist Interior | 10,140,616 | 3,413 | One concrete mesh and material, four 2K maps, 40.8 × 3.58 × 42.2 m |
| Garage/Showroom VR ready | 3,477,836 | 110,992 | Ten meshes and untextured materials, 24.8 × 7.28 × 18.58 m |
| Studio Small 04 / 08 | 22,363,519 / 14,266,631 | — | 4K EXR sources converted to 1024 × 512 Radiance HDR, 2,115,634 bytes each |

- The composed Brutalist GLB is 35,500,576 bytes and 656,073 triangles. The composed showroom is 28,837,852 bytes and 763,652 triangles. The Brutalist texture set makes it the larger download despite its lower triangle count.
- The composed files preserve the source meshes and add floor alignment and six warm spotlights. Moving the Brutalist room around the Porsche brings its real walls into frame. Model-viewer reuses the Porsche’s ground-shadow mesh and adjusts the glass material at runtime. The camera orbits the Porsche within a 6.1–8.8 m dolly range. The lighting uses a global HDR reflection map and the contact shadow is fixed to the parked car.
- Brutalist Interior by **vslite** and Garage/Showroom VR ready by **matteo.pascale**, both CC BY 4.0. The Sketchfab API confirmed both listings and download availability. [Brutalist source](https://sketchfab.com/3d-models/brutalist-interior-0eb40f2cb2bf4dfdbaae36095825788a) · [Showroom source](https://sketchfab.com/3d-models/garageshowroom-vr-ready-6a9653d1b1f84accb7e28a65b9c77fb9)
- Porsche listing by **Lionsharp Studios**, with **Karol Miklas** in the supplied GLB metadata, CC BY-SA 4.0. The car remains an illustrative local evaluation asset. [Porsche source](https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf)
- Studio Small 04 by **Greg Zaal** and Studio Small 08 by **Sergej Majboroda**, both CC0. [Studio Small 04](https://polyhaven.com/a/studio_small_04) · [Studio Small 08](https://polyhaven.com/a/studio_small_08) · [Poly Haven license](https://polyhaven.com/license)

The originals were preserved. The local rebuild tool is `mobile/renderer-lab/compose_garage.py`. Run it with Python’s NumPy and OpenEXR available, pass the original asset directory and Porsche GLB as `--assets` and `--porsche`, then set `--output` to `$env:TEMP/parkfair-5c-renderer`. For the posters, crop the matching native Garage frames to the view bounds and save `garage-brutalist-light.jpg` and `garage-brutalist-dark.jpg` alongside the GLBs. `Start-RendererLab.ps1` stages the renderer and its ADB route. These derivatives stay local pending owner approval.

## API 36 verification

- Lint and TypeScript passed. Both appearances used the matching still at Home and the live composition in Garage. The Still control showed the static fallback. Returning Home removed the Garage WebView.
- Real Android drag changed azimuth from 38° to the 76° limit. Two-point WebView pinch moved the camera from 7.8 m to the 6.1 m limit. Reset restored 38° and 7.8 m. Android’s reduced-motion setting selected the immediate reset and return path.
- During one native orbit, `gfxinfo` reported 66 app frames, two janky frames, 25 ms median and 32 ms p95. App-process PSS was about 403 MiB at Home and 424 MiB with the scene active. These are emulator samples. PSS is scoped to the app process and the frame sample measures Android presentation.
