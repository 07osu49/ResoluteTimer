#!/usr/bin/env bash
set -euo pipefail
server_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$server_root"
node scripts/prepare-linked.mjs "${1:-../dist}"
npm run build
