@echo off
title Indian Bison CRM Launcher
set "APP_URL=https://indian-bison-crm-2026.web.app"
set "LOCAL_FALLBACK=C:\Users\direc\.gemini\antigravity\scratch\greater-noida-dental-leads\public\index.html"

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=%APP_URL% --window-size=1440,920
    exit /b 0
)

if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app=%APP_URL% --window-size=1440,920
    exit /b 0
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=%APP_URL% --window-size=1440,920
    exit /b 0
)

start "" "%APP_URL%"
