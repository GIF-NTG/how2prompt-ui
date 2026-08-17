#!/bin/bash
# PostToolUse hook for how2prompt-api: format the file that was just written/edited.
# Wire into .claude/settings.json — see .claude/settings.example.json.
#
# Reads the tool_input JSON from stdin, extracts file_path, runs the project's
# Maven formatter plugin on the whole module if it's a .java file. No-op otherwise.
set -euo pipefail

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

echo "$input"

case "$file_path" in
  *.java) ;;
  *) exit 0 ;;
esac

./mvnw -q com.spotify.fmt:fmt-maven-plugin:format 2>&1 || true
