# Lacrosse Timer — personal iPhone app

Native SwiftUI app for iOS 16 or later. No dependencies, login, server, or App Store submission required. This is an Xcode source project, not a signed IPA. It has not been compiled or device-tested in the Linux creation environment.

## Install on your iPhone

You need a Mac with Xcode and an Apple account.

1. Unzip this folder on your Mac and open `LacrosseTimer.xcodeproj`.
2. In Xcode Settings > Apple Accounts, add your Apple account.
3. Select the blue project icon, then the LacrosseTimer target > Signing & Capabilities. Leave Automatically manage signing enabled and select your Personal Team.
4. Change the Bundle Identifier to a unique value, such as `com.yourname.lacrossetimer` if Xcode reports it is unavailable.
5. Connect your unlocked iPhone by USB, trust the Mac when prompted, and select your iPhone as the run destination in Xcode.
6. Enable Developer Mode on your iPhone under Settings > Privacy & Security if prompted. Restart and confirm. If the setting is missing, first pair the phone with Xcode and follow its prompts.
7. Click the Run triangle in Xcode. If asked to trust your developer profile, follow the prompt in Settings > General > VPN & Device Management.
8. The app appears on your Home Screen and runs without the Mac after installation.

With a free Personal Team, provisioning expires after seven days: reconnect to Xcode and run again. A paid Apple Developer membership provides other signing/distribution options. Apple requires device signing; downloading this ZIP on an iPhone alone does not install it. If you only have Windows, this installation route requires access to a Mac.

## Features

- Defaults to four periods of eight minutes. Choose 1–5 periods and 5/8/12/15 minutes.
- Large period and game time display, Start/Pause, Reset, Previous and Next Period.
- Four individually settable penalties: 30 seconds or 1, 2, 3 minutes.
- Game-synced penalties stop when the game ends or pauses. Running Penalty mode keeps penalties counting during pauses and between periods.
- Team names, manually entered scores, phone number, and final-score preview.
- Send Text opens Apple's message composer; review and tap Send yourself. Simulator or devices without messaging show an explanation instead.
- Local saved state and elapsed-time reconciliation when returning from another app. Running clocks continue logically while the app is away. Background alerts/horns are not included.
- Keeps the display awake while the app is visible. Settings and score details remain only on your device; uninstalling removes saved data.

Changing minutes or navigating periods pauses and resets the game clock, preserving penalties. Reset resets only the current game clock. Starting an ended period restarts that period. Running Penalty mode starts any newly set penalty immediately, even while the game is paused.

## First-run check

Start, wait a few seconds, pause, and verify time stops. Set a 30-second penalty and verify it follows the game clock. Toggle Running Penalty while paused and verify the penalty continues. Switch apps and return to check elapsed time. Enter test scores and your own phone number, tap Send Text, verify the draft, then Cancel without sending.

## Apple instructions

- https://developer.apple.com/support/compare-memberships/
- https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device
- https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device
