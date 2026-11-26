# Phase 2 design concepts

[Open isolated concept previews](concepts.html) · [Administrator preview](admin-concepts.png) · [Resident exploration preview](resident-directions.png)

## Administrator workflows

| Concept | Interaction model | Benefits and limitations | Cost and assets |
| --- | --- | --- | --- |
| A. Guided review | A linear path through cycle selection, import, validation, editing, approval and publication. Each step explains what remains and preserves the immutable revision. One focused form per mobile step, with explicit back/continue actions. | Reduces accidental publication and suits occasional administrators. Large corrections take more navigation, especially when switching between errors and the chart. | Lightweight native controls and icons, validation badges, focus restoration. No cinematic assets or complex rendering required. |
| B. Chart workbench | A persistent chart with selected row details and error filters. Switch between uploaded chart, revision diff and review while keeping row context. On mobile use a filter and row detail sheet. | Faster bulk correction and comparison. Denser screens and more learning for first-time operators. | Virtualized table or native list, accessible keyboard interaction and screen-reader row announcements. No media necessary. |

Both require an explicit publication confirmation with cycle, revision and assignment count. Activation stays separate. An error links to its row and field. A stale revision prompts reload and shows the change. Future production designs must cover empty content, interrupted imports, conflicts, validation errors, rollback/retry and small-screen controls.

## Resident exploration

Keep the current recognizable night-drive hero, automotive HUD motif, dashboard card hierarchy, deliberate layered depth, existing media originals, theme support, desktop navigation and mobile bottom navigation as the reference. Preserve the short path from opening the app to finding today's slot. Verify all asset rights before any native use.

| Direction | Interaction model | Benefits and limitations | Performance and asset needs |
| --- | --- | --- | --- |
| Cinematic luxury | Parking status and cycle sit over a poster or optional cinematic hero. Schedule and history are accessible from tabs. | Closest to the current visual identity and immediately readable. Motion must stay behind legible controls and may increase battery use. | Approved poster and short muted H.264 derivative, contrast testing and reduced-motion fallback. |
| Futuristic automotive HUD | Prioritizes the assigned slot and effective period in an instrument-style display. A flat/vehicle label anchors the information. | Fast status scanning, distinct automotive character. Excess animation or fine lines can distract at large text sizes. | Lightweight custom line artwork and optionally vetted Lottie. Test screen-reader order, labels and reduced motion. |
| Interactive digital garage | A non-3D site map highlights the resident's slot. A list and slot details offer equivalent navigation. | Useful when the resident needs to locate the slot. Requires accurate, approved floor-plan data and works less well when the layout is unknown. | Start with a small static plan and hit targets. Assess pinch/zoom, large text and contrast before any optional 3D. |

## Proposed screen inventory

- **Shared mobile entry** — sign-in, session restore, offline/error state and optional device unlock after platform approval.
- **Resident navigation** — Current Parking, Schedule, Notifications and Profile. Current Parking links to slot details and an optional map. Schedule opens upcoming and history. Profile covers vehicle, appearance, accessibility and sign-out.
- **Administrator navigation** — Dashboard, Cycles, Allocations and Settings. Cycles links to inventory and activation. Allocations opens draft intake, corrections, comparison, approval and publication history. Settings links to notification settings and audit access.

**Approval requested.** Choose administrator concept A or B and identify any resident direction to develop further. Approving a direction authorizes design refinement for that scope. The implementation revision still requires explicit owner approval.
