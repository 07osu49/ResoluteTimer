# Resolute Sideline Control — Android 3.26 with Watch APK

Regular Android phone/tablet APK with the version 3.26 interface and timer logic bundled offline in Android WebView, plus a Save Watch APK option in version 3.22. Requires Android 8.0+ and an updated Android System WebView. The phone timer does not require watch hardware.

Includes reset of all fields/timers/phone number, fixed Team 1/Team 2 labels, quarters/halves settings, GAME CLOCK label, one-second minus/plus adjustments, one-minute double claps, countdown/horn audio and final-score reporting. Send Text opens the phone's messaging app with a draft; the user sends it there.

Keep the app open during play for alerts. The display stays awake while open. Background sound alerts are not guaranteed. Data is stored on this device and does not sync with the browser, watch, or old native app.

The new app ID is `com.e9.resolutetimer`; it installs separately from native Android 2.5 and the watch app. It does not import their saved data. This is a debug-signed personal APK, not a Play Store release. Physical phone testing is still needed. Fresh build signing keys may differ, requiring uninstall/reinstall for future updates.

Build: JDK 17, Android SDK 35, Gradle 8.9. First build the watch using `gradle -p ../watch :app:testDebugUnitTest :app:assembleDebug`. Then run `python3 prepare_assets.py` and `gradle :app:assembleDebug`. GitHub Actions builds and verifies both APKs. Download the `ResoluteTimer-Phone-Watch-3.26` artifact and open `ResoluteTimer-Android-3.26.apk` on your phone. Allow installation from the specific browser/file app when Android prompts.

Version 3.19 adds four time slots (10 AM, 11 AM, noon, 1 PM). Edit lets you customize each slot's time and all four fields' team names. Main time-slot buttons select the corresponding names and scores. Slots are separate and persist locally; existing 3.16 field records are preserved in the first slot. Cancel discards unsaved edits; Reset restores every slot to defaults.

Version 3.19 removes the Slot name field and custom slot labels. Score text messages and their previews include the selected Game Time.

Version 3.19 adds the small e9 Lacrosse Customs logo before the e9 Lacrosse version text, bundled offline.

Version 3.20 adds a bottom-only Switch Team Sides button. Team labels, names and scores move together visually; stored team identities and score text stay unchanged. The display preference persists on the device and full Reset restores the original sides.

Version 3.21 replaces the full-width team switch button with a small icon in the top-right of the final score panel.

Version 3.22 embeds the standalone Watch 1.0 APK unchanged. The bottom Galaxy Watch Setup section exports it through Android's user-controlled file picker, with no storage/network/install permissions added. A help dialog links to Wear Installer 2 on Google Play. Wi-Fi installation is performed by that separate phone app, not Galaxy Wearable or this phone timer. See WATCH-PHONE-INSTALL.md. Watch 1.0 has no time slots, SMS, or phone synchronization. Physical-device testing is still required.

Version 3.23 adds a fifth equal-width editable time slot at 2 PM. Existing four-slot schedules retain their data and gain the new default slot. Full reset restores all five slots. Embedded Watch 1.0 is unchanged.

Version 3.24 adds editable field names shared across time slots. Names appear in the field selector, score heading, text preview and SMS draft. Cancel discards changes; full Reset restores Field 1–4. Existing teams, scores and slots are preserved. Watch 1.0 is unchanged.

Version 3.25 adds Load Test Schedule above the time slots. The preset includes all nine rows from IMG_0505.jpeg, names East/West/South and an unused fourth field. Training/Girls/Party entries are activities with score text sending disabled. Matchups start at 0–0. Loading saves the previous setup locally once, and Restore Previous Setup brings it back. All nine slots are editable and persist. Regular Reset returns to the normal five-slot setup but retains the test backup for recovery. Phone/watch clocks are not changed by loading the preset; Watch 1.0 is unchanged.

Version 3.26 sets a default score-report phone number when no non-empty number is saved and restores it on full Reset. A previously saved non-empty custom number is preserved. Watch 1.0 is unchanged.
