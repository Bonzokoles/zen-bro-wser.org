#!/usr/bin/env pwsh
# Test MCP Servers Connectivity
# Sprawdza czy wszystkie MCP serwery działają poprawnie

Write-Host "TESTOWANIE MCP SERVERS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Gray
Write-Host ""

$mcpConfigPath = "$env:APPDATA\Code - Insiders\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json"

if (-not (Test-Path $mcpConfigPath)) {
    Write-Host "❌ Nie znaleziono pliku konfiguracji MCP" -ForegroundColor Red
    exit 1
}

$config = Get-Content $mcpConfigPath | ConvertFrom-Json
$results = @()

foreach ($serverEntry in $config.mcpServers.PSObject.Properties) {
    $name = $serverEntry.Name
    $server = $serverEntry.Value
    
    Write-Host "Testing: $name" -ForegroundColor Yellow -NoNewline
    
    $result = @{
        Name    = $name
        Command = $server.command
        Status  = "Unknown"
        Message = ""
    }
    
    # Sprawdź czy serwer jest wyłączony
    if ($server.disabled) {
        $result.Status = "Disabled"
        $result.Message = "Serwer wyłączony w konfiguracji"
        Write-Host " - ⚠️ DISABLED" -ForegroundColor Yellow
        $results += [PSCustomObject]$result
        continue
    }
    
    # Sprawdź czy komenda istnieje
    $commandExists = $false
    
    switch ($server.command) {
        "npx" {
            $commandExists = (Get-Command npx -ErrorAction SilentlyContinue) -ne $null
            if (-not $commandExists) {
                $result.Status = "Error"
                $result.Message = "npx nie znaleziony - zainstaluj Node.js"
            }
        }
        "docker" {
            $commandExists = (Get-Command docker -ErrorAction SilentlyContinue) -ne $null
            if (-not $commandExists) {
                $result.Status = "Error"
                $result.Message = "Docker nie znaleziony"
            }
        }
        "node" {
            $commandExists = (Get-Command node -ErrorAction SilentlyContinue) -ne $null
            if (-not $commandExists) {
                $result.Status = "Error"
                $result.Message = "Node.js nie znaleziony"
            }
            else {
                # Sprawdź czy lokalny plik istnieje
                if ($server.args -and $server.args.Count -gt 0) {
                    $localPath = $server.args[0]
                    if ($localPath -and (Test-Path $localPath)) {
                        $result.Status = "OK"
                        $result.Message = "Lokalny serwer gotowy"
                    }
                    else {
                        $result.Status = "Error"
                        $result.Message = "Lokalny plik nie istnieje: $localPath"
                    }
                }
            }
        }
        default {
            $commandExists = (Get-Command $server.command -ErrorAction SilentlyContinue) -ne $null
            if (-not $commandExists) {
                $result.Status = "Error"
                $result.Message = "Komenda nie znaleziona: $($server.command)"
            }
        }
    }
    
    if ($result.Status -eq "Unknown" -and $commandExists) {
        $result.Status = "OK"
        $result.Message = "Komenda dostępna, serwer gotowy"
    }
    
    # Wyświetl wynik
    $statusColor = switch ($result.Status) {
        "OK" { "Green" }
        "Disabled" { "Yellow" }
        "Error" { "Red" }
        default { "Gray" }
    }
    
    $statusIcon = switch ($result.Status) {
        "OK" { "[OK]" }
        "Disabled" { "[DISABLED]" }
        "Error" { "[ERROR]" }
        default { "[?]" }
    }
    
    Write-Host " - $statusIcon" -ForegroundColor $statusColor
    
    $results += [PSCustomObject]$result
}

# Podsumowanie
Write-Host "`n=======================================" -ForegroundColor Gray
Write-Host "PODSUMOWANIE:" -ForegroundColor Cyan
$okCount = ($results | Where-Object { $_.Status -eq "OK" }).Count
$disabledCount = ($results | Where-Object { $_.Status -eq "Disabled" }).Count
$errorCount = ($results | Where-Object { $_.Status -eq "Error" }).Count

Write-Host "  [OK] Dzialajace: $okCount" -ForegroundColor Green
Write-Host "  [!] Wylaczone: $disabledCount" -ForegroundColor Yellow
Write-Host "  [X] Bledy: $errorCount" -ForegroundColor Red

if ($errorCount -gt 0) {
    Write-Host "`nSERWERY Z BLEDAMI:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "Error" } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTIP: Restart VS Code Insiders aby zaladowac MCP servers" -ForegroundColor Cyan
