@echo off
echo Starting Projectra Application...
echo.

echo Starting Server...
start "Projectra Server" cmd /k "cd server && npm start"

echo Waiting 5 seconds for server to start...
timeout /t 5 /nobreak > nul

echo Starting Client...
start "Projectra Client" cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Server will be available at: http://localhost:5001
echo Client will be available at: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
