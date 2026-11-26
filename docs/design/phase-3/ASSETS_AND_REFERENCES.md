# Asset rights and reference board

## Visual references

- Study calm material separation and controlled viewpoints in the Porsche configurator and Bentley personalization material. For ParkFair that means a single strong view, exact parking information and restrained interaction. Keep their layouts, marks and content out of ParkFair. [Porsche configurator](https://configurator.porsche.com/) · [Bentley configurator](https://www.bentleymotors.com/en/configurator.html)
- Preserve the current ParkFair hero's atmospheric photography and short path to parking details. The existing imagery remains source material until provenance has been verified. [Existing UI audit](../../UI_UX_AUDIT.md)
- Use the legibility, focus order and settings behavior of each native platform as a reference for the entrance, modal sheets, text scaling and reduced motion. [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) · [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility)

## Original lab art

R1, R2 and R3 are generated unbranded concept images. They show the intended finish, lighting and composition. They depict no resident's actual car. They are lab-only and require independent approval before production use. The [prompt register](IMAGE_PROMPTS.md) records the actual built-in generation inputs. The full-resolution files are adjacent to the gallery under `design-lab/assets`.

## 3D asset shortlist and actual provider previews

The linked listings show the original provider or author renders. The lab's R3 viewpoint study uses a still. No candidate mesh was imported, repriced or rendered locally. The reported surface counts and sizes are publisher measurements where stated. Unknown size, texture inputs, animation clips and rights remain acquisition checks.

| Candidate and preview | Published technical data | Rights and use decision |
| --- | --- | --- |
| Generic Sport Coupé by MMC Works | Author's viewer reports 114.1k triangles, 59.7k vertices. FBX with embedded texture maps and basic interior/mechanics. Texture resolutions, material count, clips and installed sizes are undisclosed. Convert a permitted copy to GLB and inspect normals and materials. | Attribution required, CC Attribution per listing. Confirm exact license version at download, record creator, source, license and changes, and separately review product likeness. [Author's interactive render](https://sketchfab.com/3d-models/generic-sport-coupe-car-820a13c4831c41959ce75e6c2014e882) |
| Generic Sport Car with Interior by Kinetic Vehicles | Vendor reports FBX/GLB, PBR atlas and trim sheets, up to 200k triangles with interior, approximately 96k without it, up to nine materials and articulated doors and wheels. Texture dimensions, distribution size and clips require a licensed sample. | Commercial license candidate. Confirm seller identity, exact license at checkout and permission for packaging in the app. Keep raw mesh downloads out of the distributed product. [Seller renders and specification](https://www.fab.com/listings/8e584a96-5fce-4b3a-bb8d-f69291e78c99) |
| Multi-Storey Car Park modular kit by Model Studio | Vendor reports 41 modular meshes, 28,462 triangles for one of each, LOD1 and shared tileable 2K PBR textures. Verify selected modules, formats, scene size and draw counts. Static architectural model. | Commercial license candidate. Use only an approved subset and rebuild bay geometry from the society's confirmed plan. [Seller renders and specification](https://www.fab.com/listings/c7999b3c-3528-401d-b62d-13f5d67f53a8) |
| Parking Garage HDRI by Greg Zaal | Unclipped 16K EXR/HDR source, listed 22.74 MB download at the shown setting. No mesh or rig. Bake and prefilter a low-resolution environment map after selecting the scene. | CC0, commercial use allowed and attribution optional. Separate approval of lighting appearance and asset use. [Publisher panorama and backplates](https://polyhaven.com/a/parking_garage) |
| Branded real vehicle or proprietary motion | Exact make/model, textures, logos, CAD heritage, rights and delivery terms vary. | Explicit rights-holder permission required. Seek an approved commercial model/brand agreement and separate trademark, design-right and patent review if applicable. No branded candidate selected for integration. |
| Existing resident videos and car art | Preserved at their existing locations. See source sizes and codecs in the UI audit. | Rights unclear for native redistribution. Obtain original license evidence before a native bundle. |

For the CC BY candidate, commercial adaptation and redistribution depend on meeting attribution and other license terms. A marketplace license, even with commercial rights, can restrict standalone redistribution and cannot grant rights the licensor does not own. [Creative Commons Attribution](https://creativecommons.org/licenses/by/4.0/) · [Fab license overview](https://www.fab.com/eula) · [Poly Haven licensing FAQ](https://docs.polyhaven.com/en/faq)

## Optimization and device allowance

Start with a permitted exterior-only scene. Compare silhouette and surface quality under the chosen lighting before optimizing. Profile the approved asset on a representative Android device. A textured GLB carries geometry, vertex buffers, textures and materials as separate costs. A 2K RGBA texture can consume about 16 MiB before mipmaps, so three such maps can exceed 60 MiB once mipmaps are included. This is an estimate based on pixel storage, and actual GPU compression and device residency must be measured.

Use packed roughness/metallic/occlusion textures, normal maps, mipmaps and KTX2/Basis where the renderer supports decoding. Compare meshopt and Draco on device for both transfer and load time. Use a lower exterior LOD for routine views, one active scene, baked light and reflection maps, and a limited shadow path. The parking plan stays independent of the decorative mesh and remains accurate in Eco mode.
