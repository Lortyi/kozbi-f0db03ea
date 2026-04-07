@echo off
echo ========================================
echo   KozbiSzavazas - Build
echo ========================================
echo.

echo Build inditasa...
call npm run build
if %errorlevel% neq 0 (
    echo HIBA: A build sikertelen!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build kesz! A dist mappat masold az
echo   Apache webszerver gyokerebe.
echo ========================================
pause
