# Phase 5B native design review

The redesign runs on the existing Android development client. Tap **Open design preview** on sign-in, resident home or Parking Office. Tap **Exit preview** to return to the existing layout. The preview starts off after a cold launch and is guarded by the development build. The **Light** and **Dark** controls use the app's existing appearance preference. The signed-in account and its data carry through the layout switch.

## Android captures

| Screen | Light | Dark |
| --- | --- | --- |
| Motor Court home | [Home](home-light.png) | [Home](home-dark.png) |
| Private garage | [Garage](garage-light.png) | [Garage](garage-dark.png) |
| Parking Office | [Office](office-light.png) | [Office](office-dark.png) |
| Allocation review | [Review](review-light.png) | [Review](review-dark.png) |
| Entrance | [Entrance](entrance-light.png) | [Entrance](entrance-dark.png) |
| Sign-in | [Sign-in](sign-in-light.png) | [Sign-in](sign-in-dark.png) |
| Parking plan | [Plan](plan-light.png) | [Plan](plan-dark.png) |
| Schedule | [Schedule](schedule-light.png) | [Schedule](schedule-dark.png) |
| Profile | [Profile](profile-light.png) | [Profile](profile-dark.png) |

[Resident screen recording](resident-tour.mp4) · [Office screen recording](office-tour.mp4) · [History](history-light.png) · [Inbox](inbox-light.png) · [Signed-in devices](devices-light.png) · [Flats directory](flats-light.png) · [Correction sheet](correction-dark.png) · [Inventory selector](selector-dark.png)

The resident home overlaps the current allocation plate with the automotive image and presents the next bay in a compact ledger. The garage gives the photograph its own composition and keeps the registered vehicle identifier in a separate data row. The plan uses illustrative geometry and directs users to on-site signage. Schedule and history show an editorial timeline with current, upcoming and past labels.

The office groups live occupancy metrics, dossier access and management routes. The dossier shows all five stages in one progress strip. The review summarizes eligible-flat coverage and links issues to the relevant row editor where an editable row exists. The focused sheet keeps registered inventory selectors, manual fields, search and save actions available through the existing validation workflow.

## Owner decisions

- **Layout and identity.** Review the photo and allocation overlap, the editorial schedule, the Parking Office hierarchy, the annotation-style dossier and the small stroked parking mark.
- **Typography.** The captures use the platform serif and system body face. The open-license proposal is Instrument Serif for display with Instrument Sans for body and controls. Consider more restrained system typography for dense administration. A final font choice requires on-device sizing and legibility review. [Instrument Serif license](https://github.com/google/fonts/blob/main/ofl/instrumentserif/OFL.txt) · [Instrument Sans license](https://github.com/google/fonts/blob/main/ofl/instrumentsans/OFL.txt)
- **Motion.** The preview uses a short native tab fade and correction-sheet slide. The system reduced-motion setting selects immediate changes. Signature motion and haptics remain separate approval decisions.
- **Imagery and garage.** Approve the crop, lighting direction and imagery replacement plan. The temporary, labelled photograph is static. Native 3D qualification belongs to Phase 5C.

The preview reused the isolated live allocations and existing chart APIs. Verification covered the appearance and preview switches, sign-in for both roles, resident navigation and allocation reads, and the administrator review-to-correction route. I turned off Expo's floating Tools button on the emulator before capturing the review. TypeScript, mobile lint, four mobile tests, and Android and iOS bundle exports passed. Device-level iOS and full assistive-technology evaluation remain pending.
