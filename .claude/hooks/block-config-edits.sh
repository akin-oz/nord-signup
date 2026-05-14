#!/usr/bin/env bash
# .claude/hooks/block-config-edits.sh
# Blocks edits to protected files that should only change via deliberate ADR-tracked decisions.
# Triggered by PreToolUse on Edit|Write|MultiEdit.
# Exit code via permissionDecision JSON: "deny" stops the edit.
#
# Protected paths:
# - .claude/CLAUDE.md and .claude/rules/** (rule changes must be ADR-tracked)
# - docs/adr/** (ADRs are append-only; updates must be intentional)
# - nuxt.config.ts (config changes must be ADR-tracked)
# - package.json (dependency additions must be ADR-tracked)

set -euo pipefail

FILE_PATH=$(jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

REL_PATH="${FILE_PATH#${CLAUDE_PROJECT_DIR}/}"

case "$REL_PATH" in
  .claude/CLAUDE.md|.claude/rules/*|docs/adr/*|nuxt.config.ts|package.json)
    jq -n --arg path "$REL_PATH" '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: ("Protected file: " + $path + ". Changes here require explicit user instruction and an ADR. Ask before proceeding.")
      }
    }'
    exit 0
    ;;
esac

exit 0