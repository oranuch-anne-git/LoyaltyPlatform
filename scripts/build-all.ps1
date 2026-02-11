# Build all Loyalty Platform projects (contracts, admin-backend, customer-backend, admin-portal).
# Run from repo root: .\scripts\build-all.ps1
# Or: pwsh -File scripts\build-all.ps1

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

Write-Host "=== 1/4 packages/contracts ===" -ForegroundColor Cyan
Set-Location "$root\packages\contracts"
npm install
npm run build

Write-Host "`n=== 2/4 admin-backend ===" -ForegroundColor Cyan
Set-Location "$root\admin-backend"
npm install
npx prisma generate
npm run build

Write-Host "`n=== 3/4 customer-backend ===" -ForegroundColor Cyan
Set-Location "$root\customer-backend"
npm install
npm run build

Write-Host "`n=== 4/4 admin-portal ===" -ForegroundColor Cyan
Set-Location "$root\admin-portal"
npm install
npm run build

Set-Location $root
Write-Host "`nDone. All projects built." -ForegroundColor Green
