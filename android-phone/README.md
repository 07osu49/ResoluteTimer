# Resolute Sideline Control — Android 3.52 with Watch APK

Regular Android phone/tablet APK with the version 3.52 interface and timer logic bundled offline in Android WebView, plus a Save Watch APK option in version 3.22. Requires Android 8.0+ and an updated Android System WebView. The phone timer does not require watch hardware.

Includes reset of all fields/timers/phone number, fixed Team 1/Team 2 labels, quarters/halves settings, GAME CLOCK label, one-second minus/plus adjustments, one-minute double claps, countdown/horn audio and final-score reporting. Send Text opens the phone's messaging app with a draft; the user sends it there.

Keep the app open during play for alerts. The display stays awake while open. Background sound alerts are not guaranteed. Data is stored on this device and does not sync with the browser, watch, or old native app.

The new app ID is `com.e9.resolutetimer`; it installs separately from native Android 2.5 and the watch app. It does not import their saved data. This is a debug-signed personal APK, not a Play Store release. Physical phone testing is still needed. Fresh build signing keys may differ, requiring uninstall/reinstall for future updates.

Build: JDK 17, Android SDK 35, Gradle 8.9. First build the watch using `gradle -p ../watch :app:testDebugUnitTest :app:assembleDebug`. Then run `python3 prepare_assets.py` and `gradle :app:assembleDebug`. GitHub Actions builds and verifies both APKs. Download the `ResoluteTimer-Phone-Watch-3.52` artifact and open `ResoluteTimer-Android-3.52.apk` on your phone. Allow installation from the specific browser/file app when Android prompts.

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

Version 3.27 automatically loads all nine pictured test rows once per device, retaining the previous setup backup. Load Test Schedule and Restore Previous Setup buttons are removed. Subsequent reloads preserve edits and scores instead of reloading the preset. Full Reset still returns to the normal five-slot defaults, without reapplying the test preset. The local backup remains available for a future recovery update; no recovery button is shown. Watch 1.0 is unchanged.

Version 3.28 hides the main Reset button beside e9 Lacrosse. The game-clock Reset remains available. Existing schedule and scores are preserved; Watch 1.0 is unchanged.

Version 3.29 restores the main Reset button beside e9 Lacrosse. Existing schedules and scores stay saved until Reset is pressed. The game-clock Reset and Watch 1.0 are unchanged.

Version 3.30 applies the supplied reference theme: warm cream background, dark teal game clock, white cards, sage controls, and orange actions. Reset, edit dialog, time slots, and score reporting use the new palette. Timer logic and saved schedules are unchanged; Watch 1.0 is unchanged.

Version 3.31 undoes the reference theme and restores the version 3.29 appearance. Main Reset stays visible. Saved schedules, scores, timer logic, and Watch 1.0 are unchanged.

Version 3.32 adds separate +/− controls for both teams between the final-score boxes. Each tap changes that team's score by one, never below zero, saves the selected field/time-slot score, and updates the SMS preview. Controls follow visual side switching and are disabled for scheduled activities. Watch 1.0 is unchanged.

Version 3.33 places a decrease down arrow on the left and an increase up arrow on the right inside each score box, replacing the external +/− stacks. Score logic, saved data, side switching, and Watch 1.0 are unchanged.

Version 3.34 adds visible gray boxes and borders around the score up/down arrow buttons. Positions, one-point scoring, saved data, and Watch 1.0 are unchanged.

Version 3.35 halves the visible score-arrow boxes in width and height, with proportionally smaller arrow glyphs. The original tap areas and score layout are retained. Saved data and Watch 1.0 are unchanged.

Version 3.36 doubles the visible score-arrow box width from 3.35, retains the same height, and makes arrows bold. Score logic, saved data, and Watch 1.0 are unchanged.

Version 3.37 restores Load Schedule beside TIME SLOT. It reloads the nine-row test schedule after confirmation and saves the current setup to a local manual-load backup. Normal startup preserves edits and scores. Game clock and phone number are unchanged. Watch 1.0 is unchanged.

Version 3.38 halves the main Resolute logo width and proportional height, centered above the app title. All controls and saved data are unchanged. Watch 1.0 is unchanged.

Version 3.39 styles score arrows like the game-clock +/- controls: gray background, 5px corner radius, 44x48px boxes, and bold 28px arrows. Very narrow screens use 36px width to keep scores readable. The half-size centered logo from 3.38 is retained. Saved data and Watch 1.0 are unchanged.

Version 3.40 halves score-arrow button height from 48px to 24px, keeps the width and gray button style, and uses bold 20px arrows. Half-size centered logo, score logic, saved data, and Watch 1.0 are unchanged.

Version 3.41 adds Import beside Load Schedule: local CSV/TSV, Excel XLSX/XLS, and on-device English photo OCR. Review/correct extracted CSV and preview before applying. Supports wide Time/field columns or long Time/Field/Team 1/Team 2 rows, optional scores and 1–100 time slots. Imported data replaces the schedule after confirmation; the prior setup is backed up locally. Clock and phone number are unchanged. Android has a user-selected Files picker, with no Internet or broad storage permission. OCR may misread names and columns; review every row. Dependencies/licenses are in web/dist/vendor and IMPORT-LICENSES.txt. Watch 1.0 is unchanged.

Version 3.42 adds an Add Field button beside Edit fields and teams, up to ten fields. New fields are created across every time slot. Save applies the draft; Cancel discards it. Field selection, saved schedules and imports support ten fields. Reset restores the original four fields.


Version 3.43 replaces the blocked native import confirmation with an in-screen Confirm Replace action and visible apply errors. The previous schedule is still backed up before replacement.

Version 3.44 displays Cancel and Preview Schedule with black text on light gray buttons in the import dialog.

Version 3.45 adds local PDF schedule import (up to 20 pages / 15 MB). Text PDFs use positioned text extraction; scanned pages use bundled OCR. Preview and Confirm Replace are required. Password-protected PDFs require an unlocked copy. Includes the Sample Schedule label and white logo background appearance.

Version 3.46 makes the October 18 Sixes Showdown schedule the default: 41 games, 17 time slots and five fields. Reset and Sample Schedule restore this preset. A schedule-specific update link loads it once with a local backup; later edits and scores are retained. Ordinary reopening preserves saved custom/imported schedules.

Fields are naturally sorted by name (Field 1 through Field 5). The Team Filter section above Field lists team names alphabetically. Selecting a team filters available time slots and fields, retaining team IDs and scores. All Teams restores the full schedule. The selection persists locally and is cleared by Reset or import.

Version 3.48 uses the supplied end_of_period_buzzer.mp3 clip when the Game Clock reaches zero. The original 2.82-second MP3 is bundled unchanged. Clock interaction preloads and decodes it for Web Audio playback, with media playback and existing synthesized fallback if loading fails. Penalty beeps and one-minute claps are unchanged. Includes the latest dropdown asterisks, transparent logo, hidden Sample Schedule, single-line result names, and clean team filter.

Version 3.48 adds press-and-hold Game Clock adjustments: one second on tap, repeating after 400 ms and every 100 ms until release. Keyboard Enter/Space, cancellation, and backgrounding stop safely.

Version 3.49 extends the same press-and-hold behavior to both teams’ Final Score arrows. Each tap changes one goal; holding repeats until release, cancellation, or zero. Field/time changes stop active adjustments.

Version 3.50 places minus and plus buttons around both custom game length inputs. Tap changes one quarter/half or minute; holding repeats. Existing numeric limits and typed input validation remain in effect.

Version 3.51 replaces the Team Filter and Field dropdown asterisks with white keyboard-style down arrows (↓).

Version 3.52 uses the supplied PNG arrow in both dropdowns, rendered white for contrast. Final Score controls show minus/plus, retaining their existing held-repeat behavior.
