#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_AUTH_ENV_FILE="$ROOT_DIR/apps/api-auth/.env"
API_AUTH_ENV_TEMPLATE="$ROOT_DIR/apps/api-auth/.env.template"

if [[ ! -f "$API_AUTH_ENV_FILE" ]]; then
  if [[ -f "$API_AUTH_ENV_TEMPLATE" ]]; then
    cp "$API_AUTH_ENV_TEMPLATE" "$API_AUTH_ENV_FILE"
    echo "Created apps/api-auth/.env from .env.template."
  else
    echo "Missing apps/api-auth/.env and apps/api-auth/.env.template."
    exit 1
  fi
fi

docker compose up -d --build
