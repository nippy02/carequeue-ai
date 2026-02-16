@echo off
echo ========================================
echo   CareQueue AI - Frontend Server
echo ========================================
echo.
cd /d "%~dp0frontend"
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting frontend server...
echo Frontend will open at http://localhost:3000
echo.
call npm run dev
pause
