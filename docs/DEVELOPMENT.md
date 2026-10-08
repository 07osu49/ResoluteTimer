# Development and handoff

## Web

Static HTML, CSS, and JavaScript; no dependency install or build step. Current web Version 3.8 builds on the restored 3.6. Site source commit: `0418041fc08c9c597ded83c0dc6c73793c7a70b4`. All-four-field reset behavior and JavaScript syntax were checked.

Local preview:

```sh
python3 -m http.server 8000 --directory web/dist
```

JavaScript syntax check:

```sh
node --check web/dist/app.js
```

The live Site remains hosted through Sites. Creating this repository does not change its hosting or automatically synchronize future changes.

## Android

`android/AndroidManifest.xml` reports Version 2.5 (versionCode 16), minimum API 23, target API 35. The original project was compiled manually using Android SDK tools; it has no Gradle wrapper or standard build scripts. Source and assets are preserved here, but a reproducible Android build setup still needs to be supplied. The previously created APK was build/signature checked; physical phone testing was not performed in this workspace. Its original signing key is intentionally excluded. Updates signed with a different key may require uninstalling the original application.

## Native iOS

The original Xcode project has an earlier feature set. See `ios/README.md` for installation. It needs Xcode on a Mac and Apple signing. It was not compiled or phone-tested in this Linux environment.

## Verification

Web JavaScript syntax was checked during each recent modification. Deployment success was confirmed by the hosting service. No claim of full iPhone/Android hardware testing is made.
