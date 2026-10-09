# Resolute Watch 1.0

Standalone Wear OS app targeting Galaxy Watch7 and Watch Ultra. Black, red and white touch UI adapted for round displays. Package: `com.e9.resolutewatch`, minSdk 30, target/compile SDK 35. The app is architecture-independent Java (no native ABI libraries).

Includes game timer, four armed penalty clocks, custom quarters/halves and minutes, +/- one-second game adjustments, penalty +5, sounds/vibration, four field score records and editable names. No phone synchronization, SMS, background alert service, tile, or watch-face complication.

## Build

Open this folder in Android Studio, or install JDK 17, Android SDK 35, and Gradle 8.9:

```sh
gradle :app:testDebugUnitTest :app:assembleDebug
```

The project intentionally has no Gradle wrapper; GitHub Actions installs a fixed Gradle version. AGP 8.7.3 is pinned. No external runtime library dependencies.

Source: `app/src/main/java/com/e9/resolutewatch/`. TimerEngine is separate from Android for unit testing. The workflow builds and verifies the APK before uploading it as an artifact. Tests cover penalty arming/master pause, 60/10/zero alerts, game-end boundaries and adjustments. Passing compilation/tests does not replace hardware testing.

See INSTALL.md for setup and operational limitations. Original Resolute horn audio reused from the app's supplied assets. No signing keys are committed.
