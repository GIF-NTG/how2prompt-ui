#!/bin/bash
# PostToolUse hook for how2prompt-ui: format + lint the file that was just written/edited.
# Wire into .claude/settings.json — see .claude/settings.example.json.
#
# Reads the tool_input JSON from stdin, extracts file_path, runs prettier + oxlint
# on it if it's a TS/TSX/JS/JSX file. No-op (exit 0) for anything else.
#
# Matches how2prompt-ui's actual toolchain (npm — package-lock.json, no
# pnpm-lock.yaml; oxlint per package.json's "lint" script, not eslint). If a
# different consuming project uses pnpm/yarn or eslint instead, adjust the two
# commands below for that project.
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

echo "$input"

[ -n "$file_path" ] || exit 0
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac
[ -f "$file_path" ] || exit 0

npm exec --no -- prettier --write "$file_path" 2>&1 || true
npm exec --no -- oxlint --fix "$file_path" 2>&1 || true
