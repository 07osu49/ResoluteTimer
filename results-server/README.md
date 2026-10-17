# Resolute Sixes Showdown Results

Companion app at /results on the existing Sideline Control site. The event roster and 41 scheduled games were transcribed from SixesShowdown2026 (3).pdf, using the supplied screenshot to identify Division and Team columns.

Five division standings include 28 named teams. Printed 0–0 scores are not final results. Only explicit reports count. Higher score wins; equal scores tie. Bracket placeholders require actual participants from the division roster. Display ordering is wins, goal difference, goals scored, then team name; it does not infer official bracket seeds.

Send Text queues a report before opening the user's messaging app. This records a tap, not confirmed SMS sending or delivery. No recipient phone number is uploaded. An offline outbox retries using stable submission IDs. Corrections preserve audit history and replace one game's current result; replaying an older submission cannot overwrite a later correction.

Shared storage uses D1 through /api/results. The existing site is public; results and correction controls use the same public access model. No SMS gateway or delivery callback is configured.

## Build

Install dependencies with the Sites installer or pnpm install. Run node scripts/prepare-linked.mjs with the timer dist directory, then npm run build. The prepare step generates a standalone browser outbox from the shared validation module and schedule, copies timer assets, and embeds the timer HTML in the root route. Keep the Sites Vite integration.

Tests: node tests/results.test.mjs; node tests/api.test.mjs; python3 tests/sql.test.py. Drizzle migrations must be included in the deployment archive; Sites applies them before deploying the Worker.
