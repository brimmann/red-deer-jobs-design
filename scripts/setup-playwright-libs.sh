#!/usr/bin/env bash
# Extracts Ubuntu runtime libraries for Playwright Chromium on minimal/WSL hosts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LIBROOT="$ROOT/.playwright-libs"
WORKDIR="${TMPDIR:-/tmp}/pw-libs-$$"

mkdir -p "$LIBROOT" "$WORKDIR"
cd "$WORKDIR"

PKGS=(
  libasound2t64 libatk-bridge2.0-0t64 libatk1.0-0t64 libcairo2 libfontconfig1
  libfreetype6 libgbm1 libglib2.0-0t64 libgtk-3-0t64 libpango-1.0-0
  libpangocairo-1.0-0 libpixman-1-0 libx11-6 libx11-xcb1 libxcb1
  libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2
  libxshmfence1 libdrm2 libdbus-1-3 libcups2t64 libatspi2.0-0t64
  libwayland-client0 libepoxy0 libharfbuzz0b libxcb-render0 libxcb-shm0
  libxrender1 libxi6 libxcursor1 libxinerama1 libnspr4 libnss3 libexpat1
  libgcc-s1 libstdc++6
)

for pkg in "${PKGS[@]}"; do
  apt-get download "$pkg" 2>/dev/null || true
done

shopt -s nullglob
for deb in *.deb; do
  dpkg-deb -x "$deb" "$LIBROOT"
done

rm -rf "$WORKDIR"
echo "Playwright bundled libs ready at $LIBROOT"
