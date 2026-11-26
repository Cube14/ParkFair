# Phase 4B visual checkpoint

The approved resident composition is Motor Court with Loggia's prominent bay and date information. Review the resident screens in the test app. The current fallback uses pearl and graphite colors, platform serif bay numerals, system sans labels and a static generated R3 garage study. The app labels the vehicle illustrative and shows the actual registered vehicle from the API. The parking plan uses clearly identified synthetic geometry.

| Remaining approval | Review material |
| --- | --- |
| Display typography and final imagery | Approve platform serif and system sans, or specify the display family. Confirm replacement artwork or clear the [temporary garage study](garage.png). |
| Realistic vehicle | Review the Kinetic Vehicles exterior-first option with PBR and a stated approximately 96k triangles without the interior. Confirm vendor rights to embed in both app stores and obtain a permitted evaluation copy before import. [Vendor preview](https://www.fab.com/listings/8e584a96-5fce-4b3a-bb8d-f69291e78c99) |
| Architectural environment and lighting | Review the Model Studio modular garage and CC0 panorama. Confirm marketplace terms and adaptation rights for the architectural kit. Prefilter the panorama for reflection lighting. [Garage render](https://www.fab.com/listings/c7999b3c-3528-401d-b62d-13f5d67f53a8) · [Panorama preview](https://polyhaven.com/a/parking_garage) |
| Motion, haptics and fidelity | Approve the restrained 220 ms entrance study, direct reduced-motion behavior and optional confirmation haptics. Eco is the native fallback. Premium on-demand orbit and optional Ultra require hardware results and approved assets. [Motion study](../../../design-lab/arrival.html) |
| Society geometry | Supply a verified floor plan and bay identifiers before routing a resident to a physical bay. |

The renderer study uses the cleared CC0 ToyCar, solely for material and lifecycle work. A WebView can reuse the existing model-viewer PBR study with native pinch and orbit events. Direct Expo GL gives tighter control of context and resource teardown and needs a separate PBR and input validation pass. Test a single mounted scene, release resources on route exit or backgrounding, and compare compressed textures and simplified geometry before adopting either for Premium. [Material render](material-study.png) · [Asset review](../phase-3/ASSETS_AND_REFERENCES.md) · [Expo GL](https://docs.expo.dev/versions/v58.0.0/sdk/gl-view/)
