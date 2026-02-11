#!/usr/bin/env bash
# Build all Loyalty Platform projects (contracts, admin-backend, customer-backend, admin-portal).
# Run from repo root: ./scripts/build-all.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

echo "=== 1/4 packages/contracts ==="
cd "$ROOT/packages/contracts"
npm install
npm run build

echo ""
echo "=== 2/4 admin-backend ==="
cd "$ROOT/admin-backend"
npm install
npx prisma generate
npm run build

echo ""
echo "=== 3/4 customer-backend ==="
cd "$ROOT/customer-backend"
npm install
npm run build

echo ""
echo "=== 4/4 admin-portal ==="
cd "$ROOT/admin-portal"
npm install
npm run build

cd "$ROOT"
echo ""
echo "Done. All projects built."
