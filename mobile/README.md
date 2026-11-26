# ParkFair mobile

ParkFair Mobile signs in against the shared HTTPS API. Residents can open their current parking, garage, upcoming allocation, history, inbox and account. Administrators use the five-stage Allocation Dossier for import, review, approval, publication and notification status.

1. Install Node 24 and run `npm ci` in this directory.
2. Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL` to a trusted development HTTPS endpoint ending in `/api`.
3. Configure Android Studio and a device or emulator, then run `npm run android`. On macOS with Xcode, use `npm run ios`.
4. Run `npm start` for later JavaScript-only changes. Use `npm run lint` and `npm run typecheck` before committing.

SecureStore holds the refresh token. The client rotates it on launch and keeps the access token in memory. The app clears its local session and query cache on sign-out. Consult the [mobile architecture](../docs/MOBILE_ARCHITECTURE.md) for platform verification and remaining work.

See the [device setup](../docs/PHASE_4B_DEVICE_SETUP.md) for the isolated HTTPS fixture, scoped Android development trust, Windows build commands and iPhone internal distribution.
