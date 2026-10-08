# Resolute Sideline Control — e9 Lacrosse

Lacrosse game and penalty timer with final-score reporting.

Live web app: https://resolute-sideline-iphone.truecoot2.chatgpt.site

The current live app is **Version 3.13**, based on the restored Version 3.6. This repository contains the current web source, plus the earlier native Android and iOS projects. The native projects have different feature sets; they are not ports of web Version 3.13.

## Contents

- `web/dist/`: web Version 3.13, including logo/icon and horn audio.
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
