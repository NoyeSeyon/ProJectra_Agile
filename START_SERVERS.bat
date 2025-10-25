@echo off
echo ====================================
echo Starting Projectra Application
echo ====================================
echo.

echo Killing existing Node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server (Port 5001)...
start "Backend Server" cmd /k "cd /d %~dp0server && node index.js"
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0client && npm start"

echo.
echo ====================================
echo Both servers are starting!
echo ====================================
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Super Admin Login:
echo Email: superadmin@projectra.com
echo Password: SuperAdmin@123
echo.
echo Press any key to exit this window...
pause >nul

