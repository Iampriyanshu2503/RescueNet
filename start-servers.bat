@echo off

echo Starting Food Banquet Application...
echo.

echo Starting Backend Server...
start cmd /k "cd backend1 && npm run dev"

echo.
echo Starting Frontend Server...
start cmd /k "cd frontend && npm start"

echo.
echo Servers are running!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo Access the application at http://localhost:3000