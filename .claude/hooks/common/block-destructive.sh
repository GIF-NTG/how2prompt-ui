#!/bin/bash
# PreToolUse guard for Bash: blocks obviously destructive commands before they run.
# Wire into .claude/settings.json — see .claude/settings.example.json.
#
# Reads the tool_input JSON from stdin (Claude Code PreToolUse hook contract),
# checks tool_input.command against a deny list, exits 2 (block) with a message
# on stderr if matched, otherwise exits 0 and echoes the input back through.
set -euo pipefail

input=$(cat)
command=$(echo "$input" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/')

deny_patterns=(
  'rm[[:space:]]+-rf[[:space:]]+/[[:space:]]*$'
  'rm[[:space:]]+-rf[[:space:]]+~'
  'rm[[:space:]]+-rf[[:space:]]+\$HOME'
  'git[[:space:]]+push[[:space:]]+.*--force'
  'git[[:space:]]+push[[:space:]]+.*-f[[:space:]]'
  'git[[:space:]]+reset[[:space:]]+--hard'
  ':\(\)\{[[:space:]]*:\|:&[[:space:]]*\};:'
)

for pattern in "${deny_patterns[@]}"; do
  if echo "$command" | grep -qE "$pattern"; then
    echo "[Hook] BLOCKED: command matches destructive pattern '$pattern'" >&2
    echo "[Hook] command: $command" >&2
    exit 2
  fi
done

echo "$input"
