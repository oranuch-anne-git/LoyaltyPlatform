@echo off
REM Build all Loyalty Platform projects. Double-click to run.
REM If Prisma fails with EPERM/rename error, close any running admin-backend or Node process and try again.
setlocal
cd /d "%~dp0\.."

echo === 1/4 packages/contracts ===
cd packages\contracts
call npm install
call npm run build
if errorlevel 1 goto fail

echo.
echo === 2/4 admin-backend ===
cd ..\..\admin-backend
call npm install
call npx prisma generate
if errorlevel 1 (
  echo.
  echo Prisma generate failed ^(often: admin-backend or Node is still running^).
  echo Close all terminals running admin-backend, then run this script again.
  echo Or run from a NEW Command Prompt ^(outside Cursor^): cd admin-backend ^& npx prisma generate ^& npm run build
  echo Trying npm run build anyway in case client already exists...
  echo.
)
call npm run build
if errorlevel 1 goto fail

echo.
echo === 3/4 customer-backend ===
cd ..\customer-backend
call npm install
call npm run build
if errorlevel 1 goto fail

echo.
echo === 4/4 admin-portal ===
cd ..\admin-portal
call npm install
call npm run build
if errorlevel 1 goto fail

cd "%~dp0\.."
echo.
echo Done. All projects built.
pause
exit /b 0

:fail
echo.
echo Build failed.
pause
exit /b 1
