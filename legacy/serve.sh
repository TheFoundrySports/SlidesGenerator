#!/usr/bin/env bash
# serve.sh — local dev server for the SlidesChurch presenter.
#
# Why a server and not file://?
#   The browser blocks fetch() for local JSON files under the file:// scheme.
#   The presenter loads `<deck>.notes.json` for every slide, so we need an
#   http(s) origin. Python 3 ships with `http.server`, no extra deps.
#
# Usage:
#   ./serve.sh           # serves on http://127.0.0.1:8000
#   ./serve.sh 8080      # custom port
#   PORT=3000 ./serve.sh # env var form
#
# Then open http://127.0.0.1:8000/presenter.html

set -euo pipefail

PORT="${1:-${PORT:-8000}}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 not found in PATH. Install Python 3 or run another static server." >&2
  exit 1
fi

echo "Serving SlidesChurch on http://127.0.0.1:${PORT}/"
echo "  → open http://127.0.0.1:${PORT}/presenter.html"
echo "  → directory: ${DIR}"
echo "  → press Ctrl-C to stop"
cd "${DIR}"
exec python3 -m http.server "${PORT}" --bind 127.0.0.1