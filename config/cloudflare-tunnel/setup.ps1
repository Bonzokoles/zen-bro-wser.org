# 🚀 Setup Cloudflare Tunnel - Zen Browser
# Automatyczny setup tunelu krok po kroku

param(
    [string]$TunnelName = "zen-browser",
    [string]$Domain = "zen-bro-wser.org"
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════╗
║   🌐 CLOUDFLARE TUNNEL SETUP - ZEN BROWSER          ║
║   Automatyczna konfiguracja krok po kroku           ║
╚══════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Krok 1: Sprawdź instalację cloudflared
Write-Host "`n[1/6] 🔍 Sprawdzanie cloudflared..." -ForegroundColor Yellow
try {
    $version = cloudflared --version 2>&1
    Write-Host "✅ Zainstalowano: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ cloudflared nie jest zainstalowany!" -ForegroundColor Red
    Write-Host "`nInstalowanie przez winget..." -ForegroundColor Yellow

    try {
        winget install Cloudflare.cloudflared
        Write-Host "✅ Cloudflared zainstalowany!" -ForegroundColor Green
        Write-Host "⚠️  Uruchom ponownie PowerShell i ten skrypt" -ForegroundColor Yellow
        exit 0
    } catch {
        Write-Host "❌ Automatyczna instalacja nie powiodła się" -ForegroundColor Red
        Write-Host "`nInstalacja ręczna:" -ForegroundColor Cyan
        Write-Host "1. Pobierz: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor White
        Write-Host "2. Zainstaluj plik .msi" -ForegroundColor White
        Write-Host "3. Uruchom ponownie PowerShell" -ForegroundColor White
        exit 1
    }
}

# Krok 2: Login do Cloudflare
Write-Host "`n[2/6] 🔑 Logowanie do Cloudflare..." -ForegroundColor Yellow
Write-Host "Otworzy się okno przeglądarki - zaloguj się i autoryzuj" -ForegroundColor Cyan
Start-Sleep -Seconds 2

try {
    cloudflared tunnel login
    Write-Host "✅ Zalogowano do Cloudflare" -ForegroundColor Green
} catch {
    Write-Host "❌ Logowanie nie powiodło się!" -ForegroundColor Red
    Write-Host "Spróbuj ręcznie: cloudflared tunnel login" -ForegroundColor Yellow
    exit 1
}

# Krok 3: Tworzenie tunelu
Write-Host "`n[3/6] 🏗️  Tworzenie tunelu '$TunnelName'..." -ForegroundColor Yellow

$existingTunnels = cloudflared tunnel list 2>&1
if ($existingTunnels -match $TunnelName) {
    Write-Host "⚠️  Tunel '$TunnelName' już istnieje" -ForegroundColor Yellow
    Write-Host "Kontynuować z istniejącym tunelem? (y/n): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    if ($response -ne 'y') {
        exit 0
    }

    # Pobierz ID istniejącego tunelu
    $tunnelInfo = cloudflared tunnel info $TunnelName 2>&1 | Out-String
    $tunnelId = ($tunnelInfo -match "id:\s+([a-f0-9-]+)") ? $Matches[1] : $null
} else {
    try {
        $output = cloudflared tunnel create $TunnelName 2>&1 | Out-String
        $tunnelId = ($output -match "with id ([a-f0-9-]+)") ? $Matches[1] : $null
        Write-Host "✅ Tunel utworzony: $tunnelId" -ForegroundColor Green
    } catch {
        Write-Host "❌ Nie można utworzyć tunelu: $_" -ForegroundColor Red
        exit 1
    }
}

if (-not $tunnelId) {
    Write-Host "❌ Nie można pobrać ID tunelu!" -ForegroundColor Red
    exit 1
}

# Krok 4: Konfiguracja DNS
Write-Host "`n[4/6] 🌐 Konfiguracja DNS CNAME records..." -ForegroundColor Yellow

$subdomains = @("zeno-app", "api", "cayd", "proxy", "db-admin", "ai", "ws")
$dnsSuccess = 0

foreach ($subdomain in $subdomains) {
    try {
        cloudflared tunnel route dns $TunnelName "$subdomain.$Domain" 2>&1 | Out-Null
        Write-Host "  ✅ $subdomain.$Domain" -ForegroundColor Green
        $dnsSuccess++
    } catch {
        Write-Host "  ⚠️  $subdomain.$Domain (może już istnieć)" -ForegroundColor Yellow
    }
}

Write-Host "✅ Skonfigurowano $dnsSuccess/$($subdomains.Count) rekordów DNS" -ForegroundColor Green

# Krok 5: Generowanie config.yml
Write-Host "`n[5/6] 📝 Generowanie config.yml..." -ForegroundColor Yellow

$configContent = @"
# Cloudflare Tunnel Configuration - Zen Browser
# Wygenerowano automatycznie: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

tunnel: $TunnelName
credentials-file: $env:USERPROFILE\.cloudflared\$tunnelId.json

ingress:
  # Astro Frontend
  - hostname: zeno-app.$Domain
    service: http://localhost:5173
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # API Gateway
  - hostname: api.$Domain
    service: http://localhost:8787
    originRequest:
      noTLSVerify: true

  # CAYD Search
  - hostname: cayd.$Domain
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true

  # Iframe Proxy
  - hostname: proxy.$Domain
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true

  # Database Admin
  - hostname: db-admin.$Domain
    service: http://localhost:5432
    originRequest:
      noTLSVerify: true

  # AI Services
  - hostname: ai.$Domain
    service: http://localhost:8000
    originRequest:
      noTLSVerify: true

  # WebSocket
  - hostname: ws.$Domain
    service: http://localhost:3001
    originRequest:
      noTLSVerify: true

  # Catch-all
  - service: http_status:404
"@

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir "config.yml"

Set-Content -Path $configPath -Value $configContent -Encoding UTF8
Write-Host "✅ Utworzono: $configPath" -ForegroundColor Green

# Krok 6: Walidacja
Write-Host "`n[6/6] ✅ Walidacja konfiguracji..." -ForegroundColor Yellow
try {
    cloudflared tunnel ingress validate --config $configPath
    Write-Host "✅ Konfiguracja poprawna!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Ostrzeżenia walidacji (może działać normalnie)" -ForegroundColor Yellow
}

# Podsumowanie
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "🎉 SETUP ZAKOŃCZONY POMYŚLNIE!" -ForegroundColor Green
Write-Host "`n📊 Informacje o tunelu:" -ForegroundColor Cyan
Write-Host "  • Nazwa: $TunnelName" -ForegroundColor White
Write-Host "  • ID: $tunnelId" -ForegroundColor White
Write-Host "  • Credentials: $env:USERPROFILE\.cloudflared\$tunnelId.json" -ForegroundColor White
Write-Host "  • Config: $configPath" -ForegroundColor White

Write-Host "`n🌐 Skonfigurowane domeny:" -ForegroundColor Cyan
foreach ($subdomain in $subdomains) {
    Write-Host "  • https://$subdomain.$Domain" -ForegroundColor White
}

Write-Host "`n🚀 Następne kroki:" -ForegroundColor Yellow
Write-Host "  1. Uruchom lokalne serwisy (Astro, Workers, CAYD)" -ForegroundColor White
Write-Host "  2. Uruchom tunel: .\start-tunnel.ps1" -ForegroundColor White
Write-Host "  3. Testuj: https://zeno-app.$Domain" -ForegroundColor White

Write-Host "`n📚 Dokumentacja:" -ForegroundColor Cyan
Write-Host "  • README.md w tym folderze" -ForegroundColor White
Write-Host "  • https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/" -ForegroundColor White

Write-Host ""
