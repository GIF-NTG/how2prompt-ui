#!/bin/bash
# Shared helper: format a single .java file via the project's Maven formatter
# plugin, scoped to that one file. Used by:
#   - format.sh (Claude Code PostToolUse hook — parses file_path out of the
#     stdin JSON payload, then delegates here)
#   - the OpenCode formatter config (opencode.example.java.jsonc) — invoked
#     directly with the file path as $1, no stdin JSON involved
#
# Takes the file path as $1. No-op if it's not a .java file.
set -euo pipefail

file_path="${1:-}"
[ -n "$file_path" ] || exit 0

case "$file_path" in
  *.java) ;;
  *) exit 0 ;;
esac

file_name=$(basename "$file_path")
escaped_name=$(printf '%s' "$file_name" | sed -E 's/[].[^$*+?(){}|\]/\\&/g')

./mvnw -q com.spotify.fmt:fmt-maven-plugin:format "-DfilesNamePattern=^${escaped_name}$" 2>&1 || true
