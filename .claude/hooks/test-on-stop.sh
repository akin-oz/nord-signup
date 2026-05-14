#!/usr/bin/env bash
# .claude/hooks/test-on-stop.sh
# Runs the full Vitest suite when Claude finishes a turn.
# Triggered by Stop event (no matcher; fires on every turn end).
# Exit code 2 surfaces test failures to Claude as a system reminder.

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR}"

if [ ! -f "package.json" ]; then
  exit 0
fi

if ! grep -q '"test"' package.json; then
  exit 0
fi

if ! npm test --silent 2>&1; then
  echo "" >&2
  echo "Tests failed. Address failures before considering the turn complete." >&2
  exit 2
fi

exit 0