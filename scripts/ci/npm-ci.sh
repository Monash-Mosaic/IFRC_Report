#!/usr/bin/env bash
set -euo pipefail

if [[ "${GITHUB_ACTOR:-}" == "dependabot[bot]" ]]; then
  npm install --package-lock-only --workspaces --include-workspace-root
fi

npm ci
