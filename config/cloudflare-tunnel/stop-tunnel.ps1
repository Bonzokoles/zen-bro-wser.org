# 🛑 Stop Cloudflare Tunnel - Zen Browser
# Zatrzymuje tunel i wszystkie powiązane procesy

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════╗
║   🛑 ZATRZYMYWANIE CLOUDFLARE TUNNEL        ║
╚══════════════════════════════════════════════╝
"@ -ForegroundColor Yellow

# Zatrzymaj usługę Windows (jeśli zainstalowana)
Write-Host "`n🔍 Sprawdzanie usługi Windows..." -ForegroundColor Cyan
$service = Get-Service cloudflared -ErrorAction SilentlyContinue

if ($service) {
    if ($service.Status -eq "Running") {
        Write-Host "⏸️  Zatrzymywanie usługi cloudflared..." -ForegroundColor Yellow
        Stop-Service cloudflared -Force
        Write-Host "✅ Usługa zatrzymana" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Usługa nie jest uruchomiona" -ForegroundColor Gray
    }
} else {
    Write-Host "ℹ️  Usługa nie jest zainstalowana" -ForegroundColor Gray
}

# Zakończ wszystkie procesy cloudflared
Write-Host "`n🔍 Szukanie procesów cloudflared..." -ForegroundColor Cyan
$processes = Get-Process cloudflared -ErrorAction SilentlyContinue

if ($processes) {
    Write-Host "🔪 Znaleziono $($processes.Count) proces(ów)" -ForegroundColor Yellow

    foreach ($proc in $processes) {
        try {
            Write-Host "  • PID $($proc.Id) - zatrzymywanie..." -ForegroundColor Gray
            if ($Force) {
                Stop-Process -Id $proc.Id -Force
            } else {
                Stop-Process -Id $proc.Id
            }
            Write-Host "  ✅ Zakończono PID $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Nie można zakończyć PID $($proc.Id): $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ℹ️  Brak działających procesów cloudflared" -ForegroundColor Gray
}

# Sprawdź czy porty są zwolnione
Write-Host "`n🔍 Sprawdzanie portów tunelowych..." -ForegroundColor Cyan
$tunnelPorts = @(7844, 2000)  # Domyślne porty cloudflared

foreach ($port in $tunnelPorts) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  ⚠️  Port $port wciąż zajęty przez PID $($connection.OwningProcess)" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Port $port zwolniony" -ForegroundColor Green
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "✅ Cloudflare Tunnel zatrzymany" -ForegroundColor Green
Write-Host "`nAby uruchomić ponownie:" -ForegroundColor Cyan
Write-Host "  .\start-tunnel.ps1" -ForegroundColor White
