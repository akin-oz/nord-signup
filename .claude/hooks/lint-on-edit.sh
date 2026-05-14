#!/usr/bin/env bash
# .claude/hooks/lint-on-edit.sh
# Runs ESLint on the edited file. Exits 0 on success, non-zero shows lint output to Claude.
# Triggered by PostToolUse on Edit|Write|MultiEdit with if: Edit(*.{vue,ts,js})

set -euo pipefail

FILE_PATH=$(jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR}"

if ! npx eslint --max-warnings 0 "$FILE_PATH" 2>&1; then
  echo "" >&2
  echo "ESLint failed on $FILE_PATH. Fix the errors above before continuing." >&2
  exit 2
fi

exit 0