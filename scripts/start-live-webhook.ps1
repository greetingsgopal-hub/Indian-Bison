# Indian Bison — Windows PowerShell Webhook & Tunnel Launcher
# Location: scripts/start-live-webhook.ps1

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host " 🦬 INDIAN BISON — LIVE WHATSAPP WEBHOOK RECEIVER & TUNNEL LAUNCHER" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan

$PORT = 3000
$VERIFY_TOKEN = "indian_bison_secret_2026"
$ROOT_DIR = Split-Path -Parent $PSScriptRoot

Set-Location $ROOT_DIR

# 1. Start Node Webhook Receiver in Background Job
Write-Host "[1/2] Starting local Node.js Express webhook receiver on port $PORT..." -ForegroundColor Yellow
$receiverJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    node scripts/webhook-receiver.js
} -ArgumentList $ROOT_DIR

Start-Sleep -Seconds 2

# 2. Check for Cloudflared or Ngrok or Untun
Write-Host "[2/2] Launching secure HTTPS tunnel..." -ForegroundColor Yellow

if (Get-Command cloudflared -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Using installed cloudflared binary..." -ForegroundColor Green
    cloudflared tunnel --url "http://localhost:$PORT"
} elseif (Get-Command ngrok -ErrorAction SilentlyContinue) {
    Write-Host "[✓] Using installed ngrok binary..." -ForegroundColor Green
    ngrok http $PORT
} else {
    Write-Host "[✓] Launching automated Cloudflare tunnel runner (scripts/start-live-webhook.js)..." -ForegroundColor Green
    node scripts/start-live-webhook.js
}

# Cleanup on exit
Stop-Job $receiverJob -ErrorAction SilentlyContinue
Remove-Job $receiverJob -ErrorAction SilentlyContinue
