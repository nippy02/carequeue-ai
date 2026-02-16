@echo off
echo ========================================
echo   CareQueue AI - Backend Server
echo ========================================
echo.
cd /d "%~dp0backend"
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting backend server...
echo Backend will run on http://localhost:5000
echo.
call npm start
pause
