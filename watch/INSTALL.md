# Install Resolute Timer on Galaxy Watch7 or Watch Ultra

This is a standalone Wear OS watch app, separate from the phone and web timers. It does not sync with either, and this first watch version does not send SMS. Both watches can use the same APK. Physical-watch testing has not yet been performed.

## Download the APK

1. Sign in to GitHub and open https://github.com/07osu49/ResoluteTimer/actions.
2. Open the latest successful **Build Resolute Watch APK** run.
3. Under **Artifacts**, download **ResoluteTimer-Watch**, then unzip it. The APK is `ResoluteTimer-Watch.apk`.
4. If no successful run exists, the APK is not ready. Check the run logs. A workflow file or source project is not an installable APK.

## Install using Windows, macOS, or Linux

No Mac is specifically required. Use a computer with Google's Android SDK Platform Tools: https://developer.android.com/tools/releases/platform-tools.

1. Connect the computer and watch to the same Wi-Fi network.
2. On the watch: Settings → About watch → Software information. Tap Software version repeatedly (usually seven times) to enable Developer options.
3. Open Settings → Developer options. Enable ADB debugging and Wireless debugging, then allow your network.
4. Under Wireless debugging, tap Pair new device. Note the IP address, pairing port, and pairing code.
5. In a terminal, run `adb pair WATCH_IP:PAIRING_PORT` and enter the pairing code.
6. Return to the main Wireless debugging screen. Note its connection port, which is usually different from the pairing port.
7. Run `adb connect WATCH_IP:CONNECTION_PORT`, then `adb devices` to verify the connection.
8. From the folder containing the APK, run:

```sh
adb -s WATCH_IP:CONNECTION_PORT install -r ResoluteTimer-Watch.apk
```

Replace the uppercase placeholders with the values displayed on your watch. Repeat pairing and installation separately for the Watch7 and Ultra. Disable wireless/ADB debugging afterward. Launch **Resolute Timer** from the watch app list.

## Use

- Game opens to four eight-minute quarters / halves by default.
- Game Start/Pause is the master control. The minus/plus beside the clock adjust one second each.
- Set each penalty on the Penalties screen. They wait for Start all penalties, and only run while the master game timer runs. Press the penalty button again to pause penalties.
- Game 1:00: two clap-style sounds and two vibration pulses.
- Final ten seconds: beeps and short vibration pulses.
- Game zero: horn and long vibration pulses. Penalty zero: three beeps and three short pulses.
- Settings allows custom game length/minutes, alert testing, and a confirmed full reset.
- Scores stores four fields locally; tap a team name to edit it.

Keep the app open for sound/vibration alerts. It keeps the display awake, increasing battery use. When you leave it, time is reconciled when you return, but background alarms are not delivered. Audible volume is controlled by watch media volume; silence/DND settings may affect alerts. Test alerts before using it during a game.

The GitHub build is debug-signed for personal sideloading, not a Play Store release. Each fresh runner can produce a different debug signing key, so a future APK may require uninstalling the old app first; that clears its stored data. A stable private signing key would be needed for seamless updates.

Official installation references:

- https://developer.android.com/training/wearables/get-started/debug-wifi
- https://developer.samsung.com/health/sensor/guide/connect-watch.html
