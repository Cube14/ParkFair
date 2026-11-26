# Android bring-up evidence

Baseline 2abe339bdf14dec0393ce21e68aadd88b3ee8311 on feature/parkfair-2.0-foundation. The API 37 Play x86-64 AVD and WHPX acceleration were verified. Shell JAVA_HOME and ANDROID_HOME were unset. Expo prebuild generated the ignored Android directory. The Gradle 9.4.1 wrapper started on the Android Studio JBR 25.0.4.1, then resolved compile 37, target 36, min 24, Kotlin 2.2.10, Build Tools 37.0.0 and NDK 27.1.12297006. Gradle installed the latter two in the user SDK under existing accepted licenses.

Reproduce from the mobile directory using session-local settings:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
npx expo prebuild --platform android --no-install
.\android\gradlew.bat -p android :app:assembleDebug "-PreactNativeArchitectures=x86_64" --max-workers=2 -I ..\docs\design\phase-4\short-objects.gradle
```

Two emulator launches exited during boot. A host-graphics retry reached ADB offline. Available host memory fell below 500 MB and the emulator was stopped to allow compilation to proceed. A definitive crash cause has not been established. A verified device-trusted HTTPS API URL is still needed for authenticated testing. Native login, role navigation, SecureStore, refresh/restoration, logout/revocation, disabled-account behavior, allocation reads, offline transitions and native graphics measurements are pending. Gallery screenshots are browser captures.
The initial all-ABI build hit the Windows 260-character Ninja object-path limit. A project-scoped Gradle init script sets CMAKE_OBJECT_PATH_MAX=245 for the app. The x86_64 debug build succeeded in 1 minute 59 seconds (463 tasks) and produced mobile/android/app/build/outputs/apk/debug/app-debug.apk, 94,064,465 bytes. Windows long-path policy was preserved. Kernel diagnostics on the host-renderer retry showed zygote repeatedly exiting before boot completion.
A fresh temporary emulator data directory also reached the Google boot screen. The emulator console captured the [boot frame](android-boot.png). ADB rejected APK installation with device offline. APK SHA-256 is C084EAB81196AAF87CB796FAC65240B79ACE47D9FC618AF91D72E7222304225E.
