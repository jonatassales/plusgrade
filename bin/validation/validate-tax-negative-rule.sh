#!/usr/bin/env bash
set -euo pipefail

TAX_API_BASE_URL="${TAX_API_BASE_URL:-http://localhost:7001}"

assert_status() {
  local url="$1"
  local expected="$2"
  local status

  status="$(curl -sS -o /dev/null -w "%{http_code}" "$url")"

  if [[ "$status" != "$expected" ]]; then
    echo "Tax negative validation failed url=$url expectedStatus=$expected actualStatus=$status"
    exit 1
  fi

  echo "OK url=$url status=$status"
}

assert_status "$TAX_API_BASE_URL/tax-calculator/tax-year/2018/salary/100000" 400
assert_status "$TAX_API_BASE_URL/tax-calculator/tax-year/2022/salary/-1" 400
