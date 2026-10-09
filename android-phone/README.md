# Resolute Sideline Control — Android 3.16

Regular Android phone/tablet APK with the version 3.16 interface and timer logic bundled offline in Android WebView. Requires Android 8.0+ and an updated Android System WebView. No watch hardware is required.

Includes reset of all fields/timers/phone number, fixed Team 1/Team 2 labels, quarters/halves settings, GAME CLOCK label, one-second minus/plus adjustments, one-minute double claps, countdown/horn audio and final-score reporting. Send Text opens the phone's messaging app with a draft; the user sends it there.

Keep the app open during play for alerts. The display stays awake while open. Background sound alerts are not guaranteed. Data is stored on this device and does not sync with the browser, watch, or old native app.

The new app ID is `com.e9.resolutetimer`; it installs separately from native Android 2.5 and the watch app. It does not import their saved data. This is a debug-signed personal APK, not a Play Store release. Physical phone testing is still needed. Fresh build signing keys may differ, requiring uninstall/reinstall for future updates.

Build: JDK 17, Android SDK 35, Gradle 8.9. From this folder run `python3 prepare_assets.py`, then `gradle :app:assembleDebug`. GitHub Actions automates this build. Download its `ResoluteTimer-Android-3.16` artifact, unzip, and open the APK on your Android phone. Allow installation from the specific browser/file app when Android prompts.
