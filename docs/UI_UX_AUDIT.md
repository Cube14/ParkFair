# UI and UX audit

Phase 3 visual directions and actual isolated previews are in the [owner review package](design/phase-3/REVIEW_PACKAGE.md). Existing visual assets remain in place.

Phase 2 preserves the resident design and originals. The lint fixes keep existing layout, media and motion. The owner must approve substantial changes before integration. See the [policy](design/DESIGN_APPROVAL_POLICY.md) and [isolated concepts](design/PHASE_2_CONCEPTS.md).

## Resident experience to carry forward

| Surface | Existing behavior and visual material |
| --- | --- |
| AuthLayout, AuthCard, AuthInput, AuthButton and Login | Automotive background and car illustration, layered theme-aware presentation and motion. Dark garage and light parking backgrounds are chosen from the resident originals. Login uses role-specific navigation. Signup and reset help route to the society administrator. |
| ResidentLayout, ResidentHeader, ResidentSidebar and BottomNav | Distinct resident header, desktop sidebar and compact mobile navigation. Uses React Router outlets, theme controls, and logout through AuthContext. Preserve the desktop/mobile hierarchy and accessible native equivalents. |
| HeroSection | Cinematic night-drive loop, dark overlay, animated HUD Lottie and live cycle/parking summary. Retain the driving motif, clear hierarchy and legible overlay in both appearances. |
| ParkingStatusCard | Animated parking illustration, parking state and slot. Dashboard already supplies the live assignment. |
| VehicleCard | Red luxury car footage. The baseline showed a sample model, plate, ownership and insurance. Phase 1 binds number, type and assignment status to the resident API and keeps the original layout and motion. Future video playback should pause offscreen and in the background. |
| QuickStats | Dashboard Lottie and a mix of resident allocation details and presentation values. Every production statistic needs a documented data source. |
| TimelineCard and NotificationPanel | Framer Motion transitions, timeline visuals and notification icons. NotificationPanel includes sample entries and unread counts. Verify the source of each displayed date before wiring history and an inbox. |
| ParkingStatus, Schedule, Notifications and Profile pages | Mounted shells. Settings currently live in the browser. Build real reads and settings before advertising these features. |
| Admin layout and pages | Sidebar, cycle selector, theme control, modal forms, tables and mobile cards. Keep clear status, cycle context and explicit confirmation for destructive operations. |

## Asset inventory

Metadata came from image headers, SVG/Lottie JSON and FFmpeg. Sizes are decimal MB. The originals total about 111.5 MB, with roughly 105.4 MB in the four videos. No asset-specific rights record was found in repository documentation. Confirm provenance and redistribution rights before shipping any branded, stock or third-party asset.

| Asset | Dimensions, format and duration | Current usage |
| --- | --- | --- |
| night drive inside view.mp4 | 2560?1440, H.264 High, 24 fps, 21.63 s, silent, 24.08 MB | HeroSection video |
| luxury car still red color.mp4 | 3840?2160, H.264 High, 23.98 fps, 8.63 s, no audio, 10.33 MB | VehicleCard video |
| ferrari on road.mp4 | 3840?2160, H.264 High, 23.98 fps, 15.89 s, no audio, 55.30 MB | No source import found |
| parking garage underground.mp4 | 4096?2160, H.264 High + AAC stereo, 25 fps, 4.61 s, 15.66 MB | No source import found |
| dark-parking-bg.jpg | 3712?4928, 1.38 MB | AuthLayout dark |
| light-parking-bg2.jpg | 736?920, 0.12 MB | AuthLayout light |
| light-parking-bg.jpg | 4181?2787, 2.36 MB | No source import found |
| car-hero.png | 1822?708, 1.15 MB | AuthLayout |
| parkfair-logo.svg | 1024?1024 view box, 1.9 KB | No source import found |
| notification.png, profile.png, success.png | 50?50, 50?50, 48?48. 43, 33 and 45 KB | NotificationPanel imports the notification icon. Remaining icons have no source import. |
| Car dashboard HUD UI.json | Lottie 3218?860, 60 fps, 6 s, 645 KB | HeroSection |
| dashboard.json | Lottie 613?600, 60 fps, 3.5 s, 111 KB | QuickStats |
| parking.json | Lottie 1920?1560, 24 fps, 60 s, 200 KB | ParkingStatusCard |

H.264 provides a starting point for native derivatives. The original 1440p/4K sources and bitrates need device tests before adoption. Start with muted 720p or 1080p fast-start derivatives without unused audio/data tracks, static posters, and measured crop/contrast. Keep original source assets. Preserve obsidian, graphite, titanium, pearl and crimson, distinct dashboard typography and the existing hero composition. Confirm Lottie expressions and rendering on both platforms.

## Experience levels and acceptance

- **Eco** uses posters and minimal transitions. It follows OS reduced motion and provides full information at large text sizes.
- **Premium** adds lightweight native video, vetted Lottie and purposeful motion. Pause offscreen or when the app backgrounds, and test low-power behavior.
- **Ultra** can opt in to higher-fidelity media or 3D after performance measurements. Avoid bundling media solely to reach a size target.
- Test small and large screens, light/dark contrast, reduced motion, screen readers, gestures, type scaling, frame pacing, startup, battery and memory on a device matrix. Web baseline warnings include a large JS bundle and direct eval from Lottie. The present audit does not claim hardware benchmarks or native asset licensing.
