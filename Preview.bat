@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:5500 - press Ctrl+C to stop.
where py >nul 2>nul
if %errorlevel% equ 0 (
 py -m http.server 5500 --bind 127.0.0.1 --directory dist
 exit /b
)
where node >nul 2>nul
if %errorlevel% equ 0 (
 node scripts\preview.cjs
 exit /b
)
echo Install Python 3 or Node.js, or use VS Code Live Server with dist/index.html.
pause
