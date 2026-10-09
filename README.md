# Resolute Sideline Control — e9 Lacrosse

Lacrosse game and penalty timer with final-score reporting.

Live web app: https://resolute-sideline-iphone.truecoot2.chatgpt.site

The current live app is **Version 3.16**, based on the restored Version 3.6. This repository contains the current web source, plus the earlier native Android and iOS projects. The native projects have different feature sets; they are not ports of web Version 3.16.

## Contents

- `web/dist/`: web Version 3.16, including logo/icon and horn audio.
- `android/`: Android Version 2.5 Java source, manifest, and assets.
- `ios/`: original SwiftUI project and its installation README.
- `releases/`: previously built Android APK, when available.
- `docs/USER_GUIDE.md`: web app controls and installation.
- `docs/DEVELOPMENT.md`: local preview and project status.
- `docs/CHANGELOG.md`: important versions and current rollback.

## Preview locally

Run `python3 -m http.server 8000 --directory web/dist` and open `http://localhost:8000`.

The web app saves team names, scores, settings, and timer state locally on each device. It opens Messages with a draft; sending still requires the user to confirm in Messages.

Signing keys, credentials, device data, and user screenshots are excluded. The logo is a supplied Resolute asset; no ownership or redistribution license is granted by this repository.

## Galaxy Watch7 and Watch Ultra

The standalone Wear OS app is in `watch/`. It includes game and penalty timers, sound/vibration alerts, and on-watch scores. It does not sync with the web/phone app or send SMS.

See [watch installation instructions](watch/INSTALL.md). The [watch build workflow](https://github.com/07osu49/ResoluteTimer/actions/workflows/build-watch.yml) runs unit tests and creates the debug-signed APK artifact. Physical watch testing is still required; keep the app open for alerts.
