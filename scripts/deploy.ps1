# 🚀 Quick Deploy Script
# Usage: .\deploy.ps1 [-Target pages|workers|all]

param(
    [ValidateSet("pages", "workers", "all", "setup")]
    [string]$Target = "all"
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ZENO Browser - Deployment Script  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check Wrangler
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Wrangler CLI nie jest zainstalowane!" -ForegroundColor Red
    Write-Host "Instaluję wrangler..." -ForegroundColor Yellow
    npm install -g wrangler
}

# Setup (pierwszorazowa konfiguracja)
if ($Target -eq "setup") {
    Write-Host "🔧 Setup - Konfiguracja Cloudflare..." -ForegroundColor Cyan
    
    Write-Host "`n1️⃣  Login do Cloudflare..." -ForegroundColor Yellow
    wrangler login
    
    Write-Host "`n2️⃣  Tworzenie D1 Database..." -ForegroundColor Yellow
    wrangler d1 create zeno-browser-db
    Write-Host "⚠️  Skopiuj 'database_id' i wklej do backend/wrangler.toml" -ForegroundColor Yellow
    Read-Host "Naciśnij Enter gdy gotowe"
    
    Write-Host "`n3️⃣  Tworzenie KV Namespace..." -ForegroundColor Yellow
    wrangler kv:namespace create CACHE
    Write-Host "⚠️  Skopiuj 'id' i wklej do backend/wrangler.toml" -ForegroundColor Yellow
    Read-Host "Naciśnij Enter gdy gotowe"
    
    Write-Host "`n4️⃣  Import schema do D1..." -ForegroundColor Yellow
    Push-Location "$PSScriptRoot\..\zenbrowsers_full_boilerplate\backend"
    wrangler d1 execute zeno-browser-db --file=./schema.sql
    Pop-Location
    
    Write-Host "`n5️⃣  Ustawienie API Keys (Secrets)..." -ForegroundColor Yellow
    Write-Host "Uruchom następujące komendy:" -ForegroundColor Cyan
    Write-Host "  wrangler secret put GEMINI_API_KEY" -ForegroundColor White
    Write-Host "  wrangler secret put OPENAI_API_KEY" -ForegroundColor White
    Write-Host "  wrangler secret put ANTHROPIC_API_KEY" -ForegroundColor White
    
    Write-Host "`n✅ Setup zakończony! Możesz teraz uruchomić deploy." -ForegroundColor Green
    exit 0
}

# Deploy Frontend (Cloudflare Pages)
if ($Target -eq "pages" -or $Target -eq "all") {
    Write-Host "`n📦 [1/2] Building Frontend..." -ForegroundColor Cyan
    Push-Location "$PSScriptRoot\..\ZENO_WEB_CORE_APP"
    
    # Build
    Write-Host "  → npm run build" -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    # Deploy
    Write-Host "`n🚀 Deploying to Cloudflare Pages..." -ForegroundColor Green
    wrangler pages deploy dist --project-name=zeno-browser
    
    Pop-Location
    Write-Host "✅ Frontend deployed!" -ForegroundColor Green
}

# Deploy Backend (Cloudflare Workers)
if ($Target -eq "workers" -or $Target -eq "all") {
    Write-Host "`n📦 [2/2] Deploying Backend Worker..." -ForegroundColor Cyan
    Push-Location "$PSScriptRoot\..\zenbrowsers_full_boilerplate\backend"
    
    # Check wrangler.toml
    if (-not (Test-Path "wrangler.toml")) {
        Write-Host "❌ wrangler.toml nie znaleziony!" -ForegroundColor Red
        Write-Host "Uruchom: .\deploy.ps1 -Target setup" -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
    
    # Deploy
    Write-Host "  → wrangler deploy" -ForegroundColor Gray
    wrangler deploy
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Deploy failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Host "✅ Backend deployed!" -ForegroundColor Green
}

# Summary
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       Deployment Complete! 🎉       ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Status:" -ForegroundColor Cyan
if ($Target -eq "pages" -or $Target -eq "all") {
    Write-Host "  • Frontend: https://zeno-browser.pages.dev" -ForegroundColor White
}
if ($Target -eq "workers" -or $Target -eq "all") {
    Write-Host "  • API: https://zeno-browser-api.workers.dev" -ForegroundColor White
}

Write-Host "`n📝 Monitoring:" -ForegroundColor Cyan
Write-Host "  • Logs: wrangler tail" -ForegroundColor White
Write-Host "  • Dashboard: https://dash.cloudflare.com" -ForegroundColor White

Write-Host ""
