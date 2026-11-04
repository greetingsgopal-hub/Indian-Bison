@echo off
title Indian Bison - Push to GitHub
cd /d "C:\Users\direc\.gemini\antigravity\scratch\greater-noida-dental-leads"
echo ========================================================
echo Pushing Indian Bison Dental CRM to GitHub...
echo Repository: https://github.com/greetingsgopal-hub/Indian-Bison
echo ========================================================
"C:\Users\direc\.gemini\antigravity\scratch\mingit\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Repository pushed successfully to GitHub!
) else (
    echo [ERROR] Push failed. If prompted, please complete GitHub sign-in in your browser.
)
echo ========================================================
pause
