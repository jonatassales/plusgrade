#!/usr/bin/env bash
set -euo pipefail

pnpm build
pnpm -r --if-present test
pnpm lint-staged
