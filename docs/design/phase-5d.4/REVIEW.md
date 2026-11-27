# Phase 5D.4 · Home and Garage

[Native Android recording](continuity.mp4)

Home and Garage share light and dark stills captured from the Porsche viewport on API 36. The Garage holds the still until the scene draws, then reveals the live renderer. Returning through **Motor Court** brings the camera back toward the shared view before the tab transition. The allocation rows enter in a short stagger and remain readable throughout.

The development preview uses the locked palette, serif typography, existing Porsche GLB and Phase 5D.3 lighting. Gesture feedback and zoom limits apply only to the Garage. A native drag changed the orbit angles and synthetic two-finger pinch stopped at a radius of 6.50 glTF units from the opening 8.78. The WebView detached on return to Home. Reduced motion selects immediate transitions.

The stills are local evaluation derivatives served as `porsche-light.jpg` and `porsche-dark.jpg` by the existing renderer on port 8174. The original photograph is the fallback when the local still is unavailable. [Asset credit and rights](../phase-5d.2/REVIEW.md)

The final recording shows both handoffs and two orbit gestures. A review of the dark viewport across all 373 decoded frames found no blank white frame. The fixture shows no current assignment and C-03 upcoming. Mobile lint and TypeScript passed after refreshing the still cache.
