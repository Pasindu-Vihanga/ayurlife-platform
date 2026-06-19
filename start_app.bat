@echo off
echo ========================================
echo Starting AyurLife Platform (Clean Start)
echo ========================================

echo 1/3 Cleaning Vite Cache...
if exist client\node_modules\.vite (
    rmdir /s /q client\node_modules\.vite
)

echo 2/3 Starting Backend Server...
start cmd /k "cd server && npm run dev"

echo 3/3 Starting Frontend Client...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo Done! Please wait for the servers to start.
echo If you still see a blank screen:
echo 1. Hard Refresh (Ctrl + F5) in browser.
echo 2. Check Browser Console (F12) for errors.
echo ========================================
pause
