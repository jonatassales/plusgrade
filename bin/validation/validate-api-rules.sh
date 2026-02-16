#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

"$ROOT_DIR/bin/validation/validate-tax-calculation-rule.sh"
"$ROOT_DIR/bin/validation/validate-tax-negative-rule.sh"
"$ROOT_DIR/bin/validation/validate-auth-flow.sh"
