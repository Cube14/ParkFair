# Phase 3 owner review package

Open the [local gallery](../../../design-lab/index.html) to compare homes, garages and administrator stages side by side. The gallery contains synthetic data and runs directly from local files.

| Proposal | Composition and interaction | Typography and finishes |
| --- | --- | --- |
| R1 Architectural luxury | A light editorial opening puts the effective bay before the image. The garage prioritizes the architectural setting and restrained controls. | Georgia and system sans previews, pearl and warm grey, travertine, glass, brushed metal, soft directional daylight. |
| R2 Cinematic elegance | A taller blue-hour image leads. Current facts sit over a controlled shadow gradient. The garage expands the image, then hands off to a clean parking detail. | Compact serif headings, neutral body, deep graphite, dusty wine/rose accents and controlled wet reflections. |
| R3 Interactive private garage | The decorative garage is the focal point. Parallax and zoom demonstrate camera intent. A separately labeled two-dimensional map remains available with a text equivalent. | Restrained bronze, smoke and graphite. Broad softboxes and metallic highlights keep realistic surfaces readable. |
| A1 Review dossier | A guided workbook-focused brief with the chart appearing for validation and correction. A clear review/publish checkpoint suits occasional operators. | Ivory document surfaces and high-contrast green actions. |
| A2 Guided workbench | More persistent chart context; navigation follows the same evidence and approval gates. Filter and row detail under the correction step. | Muted sage surfaces, dense but readable table, explicit issue labels and separated action area. |

[Resident homes](previews/resident-homes.png) · [Resident garages](previews/resident-garages.png) · [Responsive parking map](previews/resident-parking-map.png) · [Admin import](previews/admin-import.png) · [Admin validation](previews/admin-validation.png) · [Admin correction](previews/admin-correction.png) · [Admin publication](previews/admin-publication.png)

## Resident screen inventory and contract

All fifteen screens are viewable for R1, R2 or R3 from the gallery's screen library. The standalone preview does not authenticate or fetch resident data. Common expectations include scalable system body type, keyboard and screen-reader equivalents, generous focus targets, a readable text alternative to images/maps, and system-reduced motion. The table adds the specific data and failure states for approval.

| Screen | Purpose, entry and interaction | Data and accessible state |
| --- | --- | --- |
| Splash | Short brand entrance on launch; continue or skip to sign-in. | Local art and session-restore state. Static mark for reduced motion. |
| Onboarding | First-open parking orientation before sign-in. | Local copy with optional permissions later. Provide Skip and plain-language permissions. |
| Sign-in | Open from onboarding, logout or revocation. Enter identity and password. | Auth session response; labeled fields, busy state and generic credential/network failures. |
| Resident home | Open after resident sign-in or select Home. Read effective space and next published change. | Dashboard and schedule. Show current facts first, plus loading, empty and cached variants. |
| Garage | Open from home or navigation; optional drag/zoom with keyboard controls. | Registered vehicle identifier and independent illustration. Static poster and text fallback, no forced 3D. |
| Current parking details | Open from home or garage. Confirm bay, type, level and cycle. | Authenticated current assignment and approved site metadata. Explicit empty and retry states. |
| Parking map | Enter from details or garage. Choose a labeled bay and inspect text. | Approved floor plan and current assignment. The synthetic map is a preview and does not imply real bay geometry. |
| Upcoming allocation | Open from home, schedule or an authorized inbox event. | Next published assignment. Include effective date in accessible name; no next-entry empty state. |
| Schedule | Open via navigation or upcoming. Scan current and published future cycles. | Resident schedule; order by date, semantic list, loading and no-upcoming states. |
| Allocation history | Open from Schedule. Review past effective placements. | Resident history; accessible dated labels and empty/failure state. |
| Notification centre | Open from account or a verified delivery entry. Read an authorized event. | Account inbox; semantically identified items and unavailable/empty state. |
| Vehicle profile | Open from account or garage. See the registered identifier. | Authorized vehicle fields only. Describe imagery as illustrative; unregistered state avoids fictional data. |
| Account and sessions | Open via Account. Inspect and revoke installations or sign out. | Current session identity and scoped list. Confirm meaningful revocations and surface connectivity issues. |
| Appearance | Open within Account. View Light/Dark and graphics options. | Device preferences and capability; usable while images/renderers are unavailable. |
| Offline, loading, error and empty | Appear on affected views. Check a cached timestamp, retry or find a fallback. | Expiring account-scoped snapshot with clear freshness, or a plain error/loading/empty label. |

## Motion demonstration

In the local gallery, choose a direction and select **Play transition study**. The sequence previews brand entrance, then home, garage, parking and upcoming allocation. The interactive garage also supports keyboard arrows and zoom. Toggle **Reduce motion** for direct transitions. Maps and status text remain usable without motion. Pinch, true mesh orbit, haptics and video textures need an approved device prototype. No native gesture benchmark or screen recording is represented by these browser interactions.

[Asset shortlist and licensing](ASSETS_AND_REFERENCES.md) · [Approval register](APPROVAL_REGISTER.md)
