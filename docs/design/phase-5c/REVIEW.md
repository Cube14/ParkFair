# Phase 5C · immersive native review

Tap **Open design preview** in the Android development app. The resident route presents the new arrival composition. Use **Enter private garage** to move into the garage, then **Open Premium 3D diagnostic** to mount the isolated renderer. **Exit preview** returns to the existing app. The preview resets on a cold launch and returning users resume their authenticated role directly. The launch script still serves Metro on 8082 and the isolated HTTPS API on 5443.

## Android evidence

| Screen | Light | Dark |
| --- | --- | --- |
| Entrance | [Light](entrance-light.png) | [Dark](entrance-dark.png) |
| Authentication | [Light](sign-in-light.png) | [Dark](sign-in-dark.png) |
| Resident Home | [Light](home-light.png) | [Dark](home-dark.png) |
| Private Garage Eco | [Light](garage-eco-light.png) | [Dark](garage-eco-dark.png) |
| Targeted Parking Office proposal | [Light](office-light.png) | [Dark](office-dark.png) |

[Entrance-to-garage recording](arrival.mp4) · [Native one-finger orbit recording](orbit.mp4) · [Embedded 3D with architectural panorama](premium-environment.png) · [Synthetic two-finger pinch result](premium-pinch.png) · [Eco after backgrounding](garage-eco-after-background.png)

The home overlays a live allocation on the vehicle study, provides horizontal photo motion and carries the scene into the garage. The photo movement is a 2D treatment. The embedded Premium experiment is a genuine PBR glTF render with camera orbit, pinch and environment reflections. The diagnostic model is ToyCar from Khronos. The garage HDRI is Greg Zaal's CC0 Parking Garage at 1K. Eco uses the temporary photo and Ultra remains pending physical-device qualification. [Khronos model and credits](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ToyCar) · [HDRI preview and credit](https://polyhaven.com/a/parking_garage)

[Top-down plan](plan.png) · [Zoomed and panned plan](plan-zoom.png) · [Accessible bay list](plan-accessible.png). The geometry and highlighted A-12 are synthetic samples. The plan directs residents to on-site signage.

## Graphics choice

| Candidate | Outcome |
| --- | --- |
| RN Animated and PanResponder | Used for the isolated reveal and bounded home photo movement. Animated drives the reveal and settling transform natively. Gesture offsets arrive from JS. System reduced motion removes the reveal and parallax. |
| Reanimated and Gesture Handler | Already present through SDK 58 Router. Reconsider worklet-driven gestures if physical profiling shows JS contention. [Reanimated](https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/) · [Gesture Handler](https://docs.expo.dev/versions/v58.0.0/sdk/gesture-handler/) |
| Expo DOM WebView and model-viewer | Qualified on Android using the module already in the development client. It is now declared directly at the same SDK version. The diagnostic server is loopback-only, the WebView uses local assets and the Expo native-module bridge is disabled. The view unmounts on route blur and backgrounding. [Expo DOM components](https://docs.expo.dev/guides/dom-components/) · [model-viewer](https://modelviewer.dev/) |
| Skia | Suitable for a larger animated plan or 2D art direction. Native view geometry is sufficient for this plan sample. [Expo SDK 58 Skia](https://docs.expo.dev/versions/v58.0.0/sdk/skia/) |
| Expo GL/Three.js and Filament | Candidates for direct rendering and explicit GPU resource ownership. Expo GL would need platform-aware loaders and input. Filament needs separate native compilation and device qualification on this SDK/RN combination. [Expo GL](https://docs.expo.dev/versions/v58.0.0/sdk/gl-view/) · [React Native Filament](https://github.com/margelo/react-native-filament) |
| Decoded cinematic media | Kept as an authored entrance option pending approval of the footage, rights, startup budget and accessibility treatment. Eco uses an on-device still. |

Android qualification used the existing developer APK and the updated JavaScript dependency graph. iOS bundle export covers packaging. The current renderer harness targets Android because its local endpoint uses ADB reverse. A fresh SDK 58.1 native binary and physical iOS runtime are pending.

The reference hosted run passed backend and web and failed mobile. SDK alignment resolved Expo 58.1.0, Dev Client 58.0.22, File System 58.0.15 and Router 58.0.33 with React Native 0.88.1. The Expo check, Expo Doctor 20/20, lint, type checking, four mobile tests and both bundle exports passed locally. Hosted results for these local changes are pending. [Reference run](https://github.com/Cube14/ParkFair/actions/runs/45859986332)

## Emulator measurements

| Measurement | Observed |
| --- | --- |
| Cold app activity launch | ADB TotalTime 1,372 ms, with returning resident home verified. This measures activity launch. |
| Initial and warm model load | 1,500 ms and 578 ms on the local fixture, before the visible panorama was enabled. |
| One-finger orbit | 90 WebView animation callbacks, 16.7 ms median, 33.3 ms p95. Android host UI recorded 62 frames and 10 janky frames, 16.1%. |
| Two-finger pinch | Two synthetic contacts sent to the emulator's embedded WebView changed radius from 0.201 to 0.066 glTF units. The diagnostic reported zoom observed. |
| Process memory | 309,102 KiB PSS in Eco, 382,346 KiB with orbit active, and 399,512 KiB on the first sample after returning to Eco from background. The scene unmounted. That sample shows WebView/host process memory was still retained. |
| Textures | GLB 5,422,412 bytes and HDRI 1,653,486 bytes. Six 1K and two 512px PNGs imply about 26 MiB decoded RGBA plus mipmaps. Actual GPU residency was unavailable on this emulator. |

ADB became unresponsive and the app displayed a white screen during SDK alignment. I stopped the unused ParkFair Metro on 8081 and restarted the unresponsive API 36 AVD. The same AVD, Metro 8082 and fixture backend were operational after recovery. The renderer stays open on port 8174 for development review. To restart it, run [Start-RendererLab.ps1](../../../mobile/renderer-lab/Start-RendererLab.ps1). Its default asset cache is the prior Phase 4A study and contains ToyCar.glb and the pinned model-viewer 4.1.0 script. The launcher downloads the 1K HDRI from Poly Haven and verifies the provider checksum.

## Asset selections awaiting approval

| Candidate | Technical and rights review |
| --- | --- |
| **Vehicle** · Generic Sport Car with Interior, Kinetic Vehicles | Fab lists FBX/GLB with PBR, roughly 96k triangles without the interior, and separate wheels and doors. Use the seller's published renders for the visual decision. Obtain a written evaluation grant and confirm embedded redistribution, edits and platform terms with the seller. Public pricing was unavailable in the checked listing. [Seller renders and specifications](https://www.fab.com/listings/8e584a96-5fce-4b3a-bb8d-f69291e78c99) · [Marketplace license](https://www.fab.com/eula) |
| **Environment** · Multi-Storey Car Park, Model Studio | 41 modules, 28,462 triangles across a full set, LOD1 and shared tileable 2K textures per the seller. Confirm a permitted evaluation copy and app redistribution before import. Public pricing was unavailable in the checked listing. [Seller renders and specifications](https://www.fab.com/listings/c7999b3c-3528-401d-b62d-13f5d67f53a8) |
| **Lighting** · Parking Garage, Greg Zaal | Free CC0 HDRI. 1K was used in the isolated renderer. Color grade and final architecture remain owner decisions. [Actual panorama](https://polyhaven.com/a/parking_garage) |

Review the uninterrupted entrance, the image and allocation layering, the garage transition, the segmented Parking Office meter and the final asset candidates. Final typography, brand treatment, signature motion, imagery, vehicle and environment await approval.
