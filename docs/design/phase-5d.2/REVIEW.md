# Phase 5D.2 · Porsche local evaluation

[Light garage](porsche-light.png) · [Dark garage](porsche-dark.png) · [15-second orbit recording](orbit.mp4)

The supplied GLB was staged through `Start-RendererLab.ps1 -PorscheGlb`. It is 25,358,212 bytes and contains 45 meshes, 652,660 triangles, 14 materials and 10 embedded PNG textures from 512 × 512 through 2048 × 4096. The materials use metallic-roughness, normal, occlusion and emissive inputs, with clearcoat and transmission extensions.

The API 36 emulator rendered the complete car in both appearances with garage HDRI reflections and a contact shadow. A native diagonal drag changed both orbit angles. Two synthetic touch contacts in the embedded WebView changed the camera radius from 8.555 to 4.473 glTF units. The native **Reset view** control restored the original angles and radius. Gesture handling keeps the outer page stationary during interaction with the viewport. The photograph remains available at its native aspect ratio.

The Phase 5B palette remains locked. Home and Garage use the restored serif wordmark and display type. The Porsche is labelled illustrative and sits separately from the fixture's registered vehicle.

This is local evaluation of the owner-supplied model by Lionsharp Studios. The asset already exists in the reference commit and this checkpoint adds no raw model files. Distribution requires separate clearance for Porsche branding and third-party rights alongside the model license. [Sketchfab model](https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/legalcode)
