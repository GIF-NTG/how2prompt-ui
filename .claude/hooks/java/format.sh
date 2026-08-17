#!/bin/bash
# PostToolUse hook for how2prompt-api: format the file that was just written/edited.
# Wire into .claude/settings.json — see .claude/settings.example.json.
#
# Reads the tool_input JSON from stdin, extracts file_path, delegates the
# actual formatting to format-file.sh (shared with the OpenCode formatter
# config — see that script for why scoping to one file matters: running the
# Maven goal unscoped reformats every .java file in the module on every
# single edit; confirmed 226 files got touched before this was scoped).
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

echo "$input"

bash "$(dirname "$0")/format-file.sh" "$file_path"
