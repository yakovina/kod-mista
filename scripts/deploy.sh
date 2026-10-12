#!/usr/bin/env bash
# Збирає сайт для GitHub Pages і викладає out/ у гілку gh-pages.
# Pages налаштовано як legacy: гілка gh-pages, корінь.
set -euo pipefail
cd "$(dirname "$0")/.."

REMOTE=$(git remote get-url origin)
npm run build
touch out/.nojekyll

TMP=$(mktemp -d)
cp -R out/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git commit -q -m "Збірка $(date '+%Y-%m-%d %H:%M')"
git push -q -f "$REMOTE" gh-pages
cd - >/dev/null
rm -rf "$TMP"
echo "deploy: https://yakovina.github.io/kod-mista/"
