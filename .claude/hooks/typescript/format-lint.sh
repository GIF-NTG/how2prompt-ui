#!/bin/bash
# PostToolUse hook for how2prompt-ui: format + lint the file that was just written/edited.
# Wire into .claude/settings.json — see .claude/settings.example.json.
#
# Reads the tool_input JSON from stdin, extracts file_path, runs prettier + eslint
# on it if it's a TS/TSX/JS/JSX file. No-op (exit 0) for anything else.
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

pnpm exec prettier --write "$file_path" 2>&1 || true
pnpm exec eslint --fix "$file_path" 2>&1 || true
