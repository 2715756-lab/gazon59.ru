#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"
echo "=== Запуск backend, client и admin ==="
npx concurrently "npm run dev:backend" "npm run dev:client" "npm run dev:admin"
