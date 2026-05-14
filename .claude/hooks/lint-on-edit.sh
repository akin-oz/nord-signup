#!/usr/bin/env bash
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

if ! npx prettier --check "$FILE_PATH" 2>&1; then
  echo "" >&2
  echo "Prettier formatting check failed on $FILE_PATH. Run 'npm run format' or fix manually." >&2
  exit 2
fi

exit 0