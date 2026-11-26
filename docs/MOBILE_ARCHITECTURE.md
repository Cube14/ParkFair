# Mobile architecture

Phase 3 adds typed nonvisual integration, a protected parking snapshot and a renderer evaluation. See the [native setup](PHASE_3_NATIVE.md) and [engineering foundation](PHASE_3_ENGINEERING.md).

Phase 2 uses SecureStore for refresh credentials, rotates them on launch and keeps access tokens in memory. Existing role screens and appearance remain the baseline. On-device auth and secure storage remain unverified. [Session architecture](PHASE_2_SESSIONS.md) | [Design approval register](design/APPROVAL_REGISTER.md)

## Scaffold in this branch

The independent `mobile/` package uses Expo SDK 58, React Native 0.88, React 19.3, TypeScript and Expo Router. It targets Android and iOS. It includes Expo Dev Client and native system appearance support. The package versions come from the SDK template and `expo install`. React DOM matches the React patch level to satisfy Router's transitive peer constraints. ParkFair web continues to use Vite. [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/) ? [Expo Router installation](https://docs.expo.dev/router/installation/)

- **Routes** group sign-in, resident parking and admin occupancy. They render real API data with loading, empty and error states. Protected navigation responds to the server-confirmed role. The API enforces authorization independently.
- **Network** uses an environment-defined, trusted HTTPS base ending in `/api`. No credentials belong in `EXPO_PUBLIC_*`. Each request is bounded, and queries cancel when their scope changes.
- **Session** stores only the refresh token in SecureStore, rotates it at launch, keeps the access token in memory and removes local state and queries on sign-out. Invalid or disabled sessions clear the saved token. A failed network check allows retry without immediately deleting a valid token. [Expo SecureStore](https://docs.expo.dev/versions/v58.0.0/sdk/securestore/)
- **UI** uses semantic light/dark tokens, native safe areas, scalable text, clear focus actions and accessible loading/error labels. The current parking and occupancy screens establish API integration. Use the [resident design map](UI_UX_AUDIT.md) for the full product.
- **Data** uses TanStack Query for in-memory, account-scoped server state. No API personal data is persisted locally in Phase 1. [TanStack React Query for React Native](https://tanstack.com/query/latest/docs/framework/react/react-native)

The provisional app identifier is `com.cube14.parkfair` on both platforms. Verify package ownership before a signed build. Configure native code through Expo plugins and CNG. Run SDK compatibility checks, lint and type checks on changes. Run signed development builds on Android first and confirm iOS behavior on macOS or an approved build service. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Capability plan

| Capability | Design and verification |
| --- | --- |
| Revocable sessions and biometric unlock | Rotate a short-lived refresh session per installation. Store refresh material in SecureStore. Add OS biometrics as a local unlock layer and verify behavior after enrollment changes, device lock and reinstall. |
| Offline current/upcoming allocation | Use SQLite for minimal per-account read projections after a real need is verified. Scope records by account and cycle, track sync time and expiry, and purge on sign-out or known revocation. Require a recent authenticated session before displaying offline data and qualify cold launch without network. |
| Push and deep links | Use server-side registration per installation, unlink on logout, and send privacy-preserving payloads. Resolve links after authenticated role validation and reload the allocation by ID. Test foreground, background and cold-delivery cases with approved credentials. |
| Import and camera | Native document picker streams uploads to the shared validation/preview API. Camera scan suggests rows for confirmation and follows permission and retention rules. Administrator approval remains in the server workflow. |
| Motion, media and maps | Add Reanimated and Gesture Handler when navigation or gesture work warrants them. Evaluate native video and Lottie with optimized content. Justify Skia/3D only after measuring rendering costs on target devices. Respect reduced motion, dynamic text, haptics and battery constraints. |
| System integrations | Provide native sharing and calendar actions on demand. Plan multilingual resource strings, accessible parking maps, widgets with redacted lock-screen data and device capability settings. |

## Device acceptance

Verify fresh sign-in, role redirects and forbidden deep links, token restore and revocation, disabled accounts, SecureStore backup behavior, network failures, UI scaling and VoiceOver/TalkBack with synthetic users. Verify native video with asset rights reviewed and track phase-specific startup, frame pacing and battery budgets. Metro export and type checks do not establish device behavior.
