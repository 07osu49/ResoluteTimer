# Install on Galaxy Watch Ultra or Watch7 using your Android phone

The phone APK 3.71 contains the independent Watch 1.0 APK. No computer is required for this route, but a separate phone installer and Wi-Fi pairing are required. Galaxy Wearable does not perform this installation. The app does not attempt silent installation or collect pairing codes.

1. Install `ResoluteTimer-Android-3.22.apk` on your Android phone. Allow installation from the specific browser or file app only when prompted. Open Resolute Sideline Control.
2. Scroll to **GALAXY WATCH SETUP** at the bottom. Tap **Save Watch APK**. Choose your phone's local **Downloads** folder and save `ResoluteTimer-Watch-1.0.apk`. Do not try to install that watch APK on the phone.
3. Install **Wear Installer 2 by Malcolm Bryant** on the phone from Google Play: https://play.google.com/store/apps/details?id=org.freepoc.wearinstaller2 . This is a separate third-party app, not included in this APK.
4. Put the phone and watch on the same private Wi-Fi network. Guest networks may block the connection. Keep the watch awake during pairing and installation.
5. On the watch, open Settings > About watch > Software information and tap Software version seven times to enable Developer options. Menu names can vary by watch software.
6. In Developer options, enable ADB debugging and Wireless debugging. Accept your trusted network. Open Wireless debugging > Pair new device. Note the pairing IP, port and six-digit code.
7. In Wear Installer 2, enter the watch IP on its home screen and tap Done. Choose **Pair with watch** from its main menu and tap Enable. Enter the watch's six-digit pairing code, a space, and the pairing port, then Done. After pairing, return to the watch's main Wireless debugging screen and enter its connection port on Wear Installer 2's home screen. The connection port is different from the pairing port. Never send these codes to anyone.
8. In Wear Installer 2, select **Custom APK**, choose `ResoluteTimer-Watch-1.0.apk` from Downloads, and tap **Install**. Follow its current in-app help if screen labels differ. Developer help: https://freepoc.org/wear-installer-2-help-page/ .
9. Once installed, turn off Wireless debugging and ADB debugging on the watch. Open **Resolute Timer** from the watch app list. Test the clock, pause, sounds and vibration before using it in a game.

## What is included

- Phone 3.22: five-slot timer, slots, score text and side-switch icon, plus watch export/help controls.
- Watch 1.0: independent game timer, four penalty timers, four field score records, editable names and sound/vibration alerts.
- Watch 1.0 does not include phone synchronization, SMS, time slots or the phone's latest visual changes. Installing the APK does not sync data.
- Keep the watch app open for alerts; background alert delivery is not implemented. Audible alerts depend on media volume and watch settings.
- Build, tests, lint and signature verification do not replace physical phone/watch testing. Installation and export still need to be tested on your devices.

## Troubleshooting and security

- If no file picker opens, enable the phone's Files app. If saving fails, try a local Downloads folder rather than a cloud provider.
- If pairing fails, generate a new pairing code, confirm both devices are on the same network, and check the separate connection port.
- These APKs are debug-signed for personal testing, not Play Store releases. A signing conflict with an older build may require uninstalling that old app; uninstalling erases its locally saved data. Record your settings and scores first. Do not uninstall unless necessary.
- Do not leave debugging enabled on public Wi-Fi. Disable it when finished, and revoke the pairing authorization if you no longer use the installer.

References:
- https://developer.android.com/training/wearables/get-started/debug-wifi
- https://developer.android.com/training/wearables/get-started/debugging
- https://play.google.com/store/apps/details?id=org.freepoc.wearinstaller2
