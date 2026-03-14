# 🚀 Start Cloudflare Tunnel - Zen Browser
# Uruchamia tunel z automatyczną detekcją konfiguracji

param(
    [switch]$Debug,
    [switch]$Service
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ASCII Art Banner
Write-Host @"
╔══════════════════════════════════════════════╗
║   🌐 CLOUDFLARE TUNNEL - ZEN BROWSER        ║
║   Bezpieczne wystawienie lokalnych serwisów  ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Sprawdź instalację cloudflared
Write-Host "`n🔍 Sprawdzanie cloudflared..." -ForegroundColor Yellow
try {
    $version = (cloudflared --version 2>&1) -join "`n"
    Write-Host "✅ Znaleziono: $version" -ForegroundColor Green
}
catch {
    Write-Host "❌ cloudflared nie jest zainstalowany!" -ForegroundColor Red
    Write-Host "`nInstalacja (PowerShell jako Admin):" -ForegroundColor Yellow
    Write-Host "  winget install Cloudflare.cloudflared" -ForegroundColor White
    exit 1
}

# Sprawdź plik config.yml
$configPath = Join-Path $scriptDir "config.yml"
if (-not (Test-Path $configPath)) {
    Write-Host "`n❌ Brak pliku config.yml w $scriptDir" -ForegroundColor Red
    Write-Host "📄 Stwórz plik config.yml według wzoru z README.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Znaleziono config.yml" -ForegroundColor Green

# Walidacja konfiguracji
Write-Host "`n🔧 Walidacja ingress rules..." -ForegroundColor Yellow
try {
    $validation = cloudflared tunnel ingress validate --config $configPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Konfiguracja poprawna" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Ostrzeżenia w konfiguracji:" -ForegroundColor Yellow
        Write-Host $validation
    }
}
catch {
    Write-Host "⚠️  Nie można zwalidować (tunel może nie istnieć)" -ForegroundColor Yellow
}

# Sprawdź czy lokalne serwisy działają
Write-Host "`n🔍 Sprawdzanie lokalnych serwisów..." -ForegroundColor Yellow
$ports = @(5173, 8787, 3000, 8080)
$portsOk = $true

foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "  ✅ Port $port - działa" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️  Port $port - nie odpowiada" -ForegroundColor Yellow
            $portsOk = $false
        }
    }
    catch {
        Write-Host "  ⚠️  Port $port - nie można sprawdzić" -ForegroundColor Yellow
    }
}

if (-not $portsOk) {
    Write-Host "`n⚠️  Niektóre serwisy nie działają - tunel może zwracać 502!" -ForegroundColor Yellow
    Write-Host "Kontynuować? (y/n): " -ForegroundColor Cyan -NoNewline
    $response = Read-Host
    if ($response -ne 'y') {
        exit 0
    }
}

# Wyświetl informacje o tunelu
Write-Host "`n📊 Lista tuneli:" -ForegroundColor Cyan
try {
    cloudflared tunnel list
}
catch {
    Write-Host "⚠️  Nie można pobrać listy tuneli (zaloguj się: cloudflared tunnel login)" -ForegroundColor Yellow
}

# Uruchom tunel
Write-Host "`n🚀 Uruchamianie tunelu zen-browser..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$tunnelArgs = @(
    "tunnel",
    "--config", $configPath
)

if ($Debug) {
    $tunnelArgs += @("--loglevel", "debug")
}

if ($Service) {
    Write-Host "📦 Instalowanie jako Windows Service..." -ForegroundColor Yellow
    cloudflared service install
    Start-Sleep -Seconds 2
    Start-Service cloudflared
    Write-Host "✅ Usługa uruchomiona!" -ForegroundColor Green
    Write-Host "`nSprawdź status: Get-Service cloudflared" -ForegroundColor Cyan
    exit 0
}

$tunnelArgs += @("run", "zen-browser")

Write-Host "Komenda: cloudflared $($tunnelArgs -join ' ')" -ForegroundColor DarkGray
Write-Host "`n🌐 Dostępne adresy:" -ForegroundColor Cyan
Write-Host "  • https://zeno-app.zen-bro-wser.org" -ForegroundColor White
Write-Host "  • https://api.zen-bro-wser.org" -ForegroundColor White
Write-Host "  • https://cayd.zen-bro-wser.org" -ForegroundColor White
Write-Host "  • https://proxy.zen-bro-wser.org" -ForegroundColor White
Write-Host "`nNaciśnij Ctrl+C aby zatrzymać...`n" -ForegroundColor Yellow

try {
    & cloudflared $tunnelArgs
}
catch {
    Write-Host "`n❌ Błąd uruchamiania tunelu: $_" -ForegroundColor Red
    exit 1
}
