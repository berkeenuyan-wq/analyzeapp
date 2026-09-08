#!/usr/bin/env bash
# Regenerate frontend/src/styles/tokens.css from the v1 design tokens.
# The token CSS in assets/tokens/ is the source of truth (dark = bare :root,
# [data-theme="light"] re-scopes). Run from the repo root.
set -euo pipefail
cd "$(dirname "$0")/.."

out="frontend/src/styles/tokens.css"
{
  echo "/* Design System tokens — generated from ../../assets/tokens/*.css (v1)."
  echo "   Dark is the bare :root base; [data-theme=\"light\"] re-scopes the aliases."
  echo "   Regenerate with: scripts/build-tokens.sh */"
  echo
  for f in fonts colors typography spacing radius elevation motion base; do
    echo "/* ===== $f.css ===== */"
    cat "assets/tokens/$f.css"
    echo
  done
} > "$out"
echo "wrote $out ($(wc -l < "$out") lines)"
