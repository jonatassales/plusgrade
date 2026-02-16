#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: bin/hooks/commit-msg.sh <commit-msg-file>"
  exit 1
fi

pnpm commitlint --edit "$1"
status=$?

if [[ $status -ne 0 ]]; then
  echo
  echo "Conventional commit check failed."
  echo "Expected format: <type>(optional-scope): <description>"
  echo "Examples:"
  echo "  feat(auth): add refresh token endpoint"
  echo "  fix(web): handle empty income input"
  echo \
    "Allowed types: feat, fix, docs, style, refactor, test, chore, ci, build, perf, revert"
  echo "See https://www.conventionalcommits.org/en/v1.0.0/ for more details."
  echo
fi

exit "$status"
