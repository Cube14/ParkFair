# Phase 3 native development and rendering

## Windows readiness

Node 24.14.1 and npm 11.11.0 are present. Java and javac resolve through the Oracle installer and report JDK 25.0.1. Android Studio, its default SDK path, ANDROID_HOME, Android platform tools/ADB, emulator/AVDs, and standalone Gradle were not found. Windows reported no devices in the Android USB device class. Without ADB, connected-device status is unverified. There is no configured and verified device-trusted API HTTPS endpoint. Native compilation and installation were therefore blocked. The Expo bundle exports verify the JS entry points.

Expo SDK 58 pairs with React Native 0.88 and its versioned compatibility matrix lists compile SDK 37, target SDK 36, Android 7+, iOS 16.4+ and Xcode 26.4+. Expo's SDK 58 build image uses Java 17 and NDK 27.1.12297006. Use JDK 17 for parity and verify generated Android Gradle requirements. Use the project's Gradle wrapper once generated. [Expo SDK matrix](https://docs.expo.dev/versions/v58.0.0/) · [Expo build images](https://docs.expo.dev/build-reference/infrastructure/)

With approval, install Android Studio locally using the official instructions. Use SDK Manager to install platform 37, appropriate build tools, platform tools, Android Emulator and a supported Google APIs system image. Verify required NDK from the generated project. Create an AVD or authorize a physical device with USB debugging. Set the following for the current PowerShell session, replacing the example paths with the installed locations. [Android Studio setup](https://developer.android.com/studio/install) · [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)

```powershell
$env:JAVA_HOME = 'C:\path\to\jdk-17'
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:Path"
adb devices -l
Set-Location 'E:\ParkFair\mobile'
npm.cmd ci
npx.cmd expo install --check
npx.cmd expo-doctor
npx.cmd expo run:android --device
```

Set `EXPO_PUBLIC_API_URL` to the approved same-network HTTPS fixture endpoint ending in `/api`. The certificate must match the hostname and be trusted by the device. ADB reverse alone provides routing. For a private CA, use an explicitly approved development-only trust configuration and leave certificate verification enabled. iOS needs macOS/Xcode or an approved build service and equivalent isolated HTTPS verification. [Android network security configuration](https://developer.android.com/privacy-and-security/security-config)

Run native tests with synthetic admin and resident credentials. Capture device/model, OS and build ID, role navigation, forbidden deep links, cold restore and SecureStore rotation, session expiry, logout and revocation, disabled accounts, network loss, background/resume and account isolation. Record separate results for Android and iOS.

## Renderer evaluation

| Option | Role and trade-off |
| --- | --- |
| Expo Video | Native video decoding for a muted cinematic hero. Use an approved poster, release offscreen player resources and verify formats, frame pacing and battery. Weight and memory depend on the rendition. [Video SDK](https://docs.expo.dev/versions/v58.0.0/sdk/video/) |
| Reanimated and Gesture Handler | Candidate for UI-thread transition and gesture interactions. Use Expo-aligned versions and native rebuilds. Start with stack transitions, add only for an approved interaction. [Reanimated](https://docs.expo.dev/versions/v58.0.0/sdk/reanimated/) · [Gesture Handler](https://docs.expo.dev/versions/v58.0.0/sdk/gesture-handler/) |
| Skia | Candidate for a 2D parking map or advanced compositing. Adds native footprint. Compare against a semantic native layout with equivalent labels and hit targets. [Skia](https://docs.expo.dev/versions/v58.0.0/sdk/skia/) |
| Lottie or Rive | Lottie suits small finite vector motion when existing visuals or an approved derivative fit. Evaluate Rive only for a genuine interactive state graph, with runtime and authoring compatibility tested. Neither replaces the reduced-motion path. [Lottie](https://github.com/lottie-react-native/lottie-react-native) · [Rive React Native runtime](https://rive.app/docs/runtimes/react-native/react-native) |
| Expo GL and Three.js-compatible loader | Candidate for one optional garage scene. Test compatible loader/extension support with glTF PBR, packed maps, environment reflections and baked lighting. It adds frame, memory, native module and lifecycle complexity. [Expo GLView](https://docs.expo.dev/versions/v58.0.0/sdk/gl-view/) |
| Dedicated native renderer | Consider after device data shows a concrete quality or performance need that the smaller approaches cannot meet. Higher integration, upgrade and platform testing cost. |

No renderer dependency was added. Use static imagery and text in **Eco**, an optimized poster/video and restrained transitions in **Premium**, and an optional approved exterior mesh and lighting in **Ultra**. Offscreen/background pause, one expensive scene at a time, and OS reduced-motion must be entry criteria for a native experiment. The functional parking UI and approved map remain independent of the decorative scene.

Measure bundle size, signed download, installed size, bundled and optional media, protected cache, startup, peak memory/GPU allocation, frame pacing and thermal/battery costs separately. Track these on at least a representative low-tier and modern Android device before setting release thresholds. The local lab art is about 7.39 MB of PNG files. This is a file-size measurement, separate from the native bundle. No device render or thermal measurements are available.
