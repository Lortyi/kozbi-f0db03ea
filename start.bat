@echo off
echo ========================================
echo   KozbiSzavazas - Build es Inditas
echo ========================================
echo.

echo [1/3] Build inditasa...
call npm run build
if %errorlevel% neq 0 (
    echo HIBA: A build sikertelen!
    pause
    exit /b 1
)
echo Build kesz!
echo.

echo [2/3] Korabbi PM2 folyamat torlese (ha van)...
call pm2 delete KozbiSzavazas >nul 2>&1

echo [3/3] Alkalmazas inditasa PM2-vel...
call pm2 start server.js --name "KozbiSzavazas"
call pm2 save

echo.
echo ========================================
echo   Az alkalmazas fut: http://localhost:8080
echo ========================================
pause
