#!/usr/bin/env bash
set -euo pipefail

TAX_API_BASE_URL="${TAX_API_BASE_URL:-http://localhost:7001}"

assert_total_tax() {
  local salary="$1"
  local expected="$2"
  local url="$TAX_API_BASE_URL/tax-calculator/tax-year/2022/salary/$salary"

  local response
  response="$(curl -sS "$url")"

  local actual
  actual="$(node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync(0,'utf8')); if (typeof d.totalTax !== 'number') process.exit(2); process.stdout.write(String(d.totalTax));" <<<"$response")"

  if ! node -e "const a=Number(process.argv[1]); const b=Number(process.argv[2]); process.exit(Math.abs(a-b) <= 0.01 ? 0 : 1)" "$actual" "$expected"; then
    echo "Tax validation failed for salary=$salary expected=$expected actual=$actual"
    exit 1
  fi

  echo "OK salary=$salary totalTax=$actual"
}

assert_total_tax 0 0
assert_total_tax 50000 7500
assert_total_tax 100000 17739.17
assert_total_tax 1234567 385587.65
