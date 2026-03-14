# 🧪 Test Cloudflare Tunnel - Zen Browser
# Sprawdza wszystkie endpointy i lokalną konfigurację

param(
    [switch]$Detailed
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════╗
║   🧪 CLOUDFLARE TUNNEL - DIAGNOSTYKA                ║
╚══════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$results = @()
$domain = "zen-bro-wser.org"

# Test 1: Instalacja cloudflared
Write-Host "`n[1/5] 🔍 Sprawdzanie instalacji cloudflared..." -ForegroundColor Yellow
try {
    $version = cloudflared --version 2>&1 | Out-String
    Write-Host "✅ Zainstalowano: $($version.Trim())" -ForegroundColor Green
    $results += @{Test = "Instalacja"; Status = "✅"; Details = $version.Trim() }
}
catch {
    Write-Host "❌ cloudflared nie jest zainstalowany!" -ForegroundColor Red
    $results += @{Test = "Instalacja"; Status = "❌"; Details = "Nie znaleziono" }
}

# Test 2: Konfiguracja
Write-Host "`n[2/5] 📝 Sprawdzanie konfiguracji..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir "config.yml"

if (Test-Path $configPath) {
    Write-Host "✅ Znaleziono config.yml" -ForegroundColor Green

    # Walidacja ingress rules
    try {
        $validation = cloudflared tunnel ingress validate --config $configPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Konfiguracja poprawna" -ForegroundColor Green
            $results += @{Test = "Config"; Status = "✅"; Details = "Walidacja OK" }
        }
        else {
            Write-Host "⚠️  Ostrzeżenia walidacji" -ForegroundColor Yellow
            $results += @{Test = "Config"; Status = "⚠️"; Details = "Ostrzeżenia" }
        }
    }
    catch {
        Write-Host "⚠️  Nie można zwalidować" -ForegroundColor Yellow
        $results += @{Test = "Config"; Status = "⚠️"; Details = "Błąd walidacji" }
    }
}
else {
    Write-Host "❌ Brak pliku config.yml - uruchom setup.ps1" -ForegroundColor Red
    $results += @{Test = "Config"; Status = "❌"; Details = "Brak pliku" }
}

# Test 3: Lokalne serwisy
Write-Host "`n[3/5] 🌐 Sprawdzanie lokalnych serwisów..." -ForegroundColor Yellow
$services = @(
    @{Name = "Astro Frontend"; Port = 5173; Required = $true },
    @{Name = "Cloudflare Workers"; Port = 8787; Required = $true },
    @{Name = "CAYD Search"; Port = 3000; Required = $false },
    @{Name = "Iframe Proxy"; Port = 8080; Required = $false },
    @{Name = "Database Admin"; Port = 5432; Required = $false }
)

$servicesOk = 0
foreach ($service in $services) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -InformationLevel Quiet
        if ($connection) {
            Write-Host "  ✅ $($service.Name) (port $($service.Port))" -ForegroundColor Green
            $servicesOk++
            $results += @{Test = $service.Name; Status = "✅"; Details = "Port $($service.Port) aktywny" }
        }
        else {
            if ($service.Required) {
                Write-Host "  ❌ $($service.Name) (port $($service.Port)) - WYMAGANY!" -ForegroundColor Red
                $results += @{Test = $service.Name; Status = "❌"; Details = "Nie działa (wymagany)" }
            }
            else {
                Write-Host "  ⚠️  $($service.Name) (port $($service.Port)) - opcjonalny" -ForegroundColor Yellow
                $results += @{Test = $service.Name; Status = "⚠️"; Details = "Nie działa (opcjonalny)" }
            }
        }
    }
    catch {
        Write-Host "  ⚠️  $($service.Name) - nie można sprawdzić" -ForegroundColor Yellow
    }
}

Write-Host "`nDziała $servicesOk/$($services.Count) serwisów" -ForegroundColor $(if ($servicesOk -ge 2) { "Green" }else { "Yellow" })

# Test 4: Status tunelu
Write-Host "`n[4/5] 🔌 Sprawdzanie statusu tunelu..." -ForegroundColor Yellow
try {
    $tunnelList = cloudflared tunnel list 2>&1 | Out-String
    if ($tunnelList -match "zen-browser") {
        Write-Host "✅ Tunel 'zen-browser' istnieje" -ForegroundColor Green
        $results += @{Test = "Tunel"; Status = "✅"; Details = "Zarejestrowany" }

        # Sprawdź czy działa
        $processes = Get-Process cloudflared -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "✅ Tunel uruchomiony ($($processes.Count) proces(ów))" -ForegroundColor Green
            $results += @{Test = "Tunel Running"; Status = "✅"; Details = "$($processes.Count) proces(ów)" }
        }
        else {
            Write-Host "⚠️  Tunel nie jest uruchomiony" -ForegroundColor Yellow
            $results += @{Test = "Tunel Running"; Status = "⚠️"; Details = "Nie działa" }
        }
    }
    else {
        Write-Host "❌ Tunel 'zen-browser' nie istnieje - uruchom setup.ps1" -ForegroundColor Red
        $results += @{Test = "Tunel"; Status = "❌"; Details = "Nie zarejestrowany" }
    }
}
catch {
    Write-Host "❌ Nie można sprawdzić statusu tunelu" -ForegroundColor Red
    $results += @{Test = "Tunel"; Status = "❌"; Details = "Błąd sprawdzania" }
}

# Test 5: DNS i publiczne endpointy
Write-Host "`n[5/5] 🌍 Sprawdzanie publicznych endpointów..." -ForegroundColor Yellow
$endpoints = @(
    "zeno-app.$domain",
    "api.$domain",
    "cayd.$domain",
    "proxy.$domain"
)

$dnsOk = 0
foreach ($endpoint in $endpoints) {
    try {
        $dns = Resolve-DnsName $endpoint -ErrorAction SilentlyContinue
        if ($dns) {
            Write-Host "  ✅ DNS: $endpoint" -ForegroundColor Green
            $dnsOk++

            # Test HTTP jeśli -Detailed
            if ($Detailed) {
                try {
                    $response = Invoke-WebRequest -Uri "https://$endpoint" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
                    Write-Host "      → HTTP $($response.StatusCode)" -ForegroundColor Gray
                }
                catch {
                    Write-Host "      → HTTP Error (może być OK jeśli serwis nie działa)" -ForegroundColor DarkGray
                }
            }
        }
        else {
            Write-Host "  ❌ DNS: $endpoint - nie rozwiązuje" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ⚠️  DNS: $endpoint - błąd sprawdzania" -ForegroundColor Yellow
    }
}

Write-Host "`nDNS poprawny dla $dnsOk/$($endpoints.Count) subdomen" -ForegroundColor $(if ($dnsOk -eq $endpoints.Count) { "Green" }else { "Yellow" })

# Podsumowanie
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "📊 PODSUMOWANIE DIAGNOSTYKI" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$passed = ($results | Where-Object { $_.Status -eq "✅" }).Count
$warnings = ($results | Where-Object { $_.Status -eq "⚠️" }).Count
$failed = ($results | Where-Object { $_.Status -eq "❌" }).Count

Write-Host "`n✅ Passed:   $passed" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warnings" -ForegroundColor Yellow
Write-Host "❌ Failed:   $failed" -ForegroundColor Red

# Szczegóły jeśli -Detailed
if ($Detailed) {
    Write-Host "`n📋 Szczegółowe wyniki:" -ForegroundColor Cyan
    $results | Format-Table -Property @{Label = "Test"; Expression = { $_.Test }; Width = 25 },
    @{Label = "Status"; Expression = { $_.Status }; Width = 8 },
    @{Label = "Szczegóły"; Expression = { $_.Details }; Width = 50 } -Wrap
}

# Rekomendacje
Write-Host "`n💡 Rekomendacje:" -ForegroundColor Cyan

if ($failed -gt 0) {
    if ($results | Where-Object { $_.Test -eq "Config" -and $_.Status -eq "❌" }) {
        Write-Host "  1. Uruchom setup: .\setup.ps1" -ForegroundColor White
    }
    if ($results | Where-Object { $_.Test -eq "Tunel" -and $_.Status -eq "❌" }) {
        Write-Host "  2. Utwórz tunel: cloudflared tunnel create zen-browser" -ForegroundColor White
    }
}

if ($servicesOk -lt 2) {
    Write-Host "  • Uruchom wymagane serwisy (Astro + Workers)" -ForegroundColor White
}

if ($results | Where-Object { $_.Test -eq "Tunel Running" -and $_.Status -eq "⚠️" }) {
    Write-Host "  • Uruchom tunel: .\start-tunnel.ps1" -ForegroundColor White
}

if ($dnsOk -lt $endpoints.Count) {
    Write-Host "  • Skonfiguruj DNS: cloudflared tunnel route dns zen-browser <subdomain>.zen-bro-wser.org" -ForegroundColor White
    Write-Host "  • Lub poczekaj 5 min na propagację DNS" -ForegroundColor White
}

# Status końcowy
Write-Host ""
if ($failed -eq 0 -and $warnings -le 2) {
    Write-Host "🎉 System gotowy do użycia!" -ForegroundColor Green
}
elseif ($failed -eq 0) {
    Write-Host "✅ System działa z drobnymi ostrzeżeniami" -ForegroundColor Yellow
}
else {
    Write-Host "⚠️  Wymagane poprawki przed uruchomieniem" -ForegroundColor Red
}

Write-Host ""
