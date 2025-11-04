# ZENO Browser - Backup & Restore System
# Simple and reliable backup solution

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('backup', 'restore', 'list')]
    [string]$Action = 'backup',
    
    [Parameter(Mandatory=$false)]
    [string]$BackupName = ""
)

$BackupDir = "V:\PROTO_TYpy\ZENO_web_CORE\BACKUPS"
$AppDir = "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP"
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

function Create-Backup {
    param($Name)
    
    if ([string]::IsNullOrEmpty($Name)) {
        $Name = "auto_$Timestamp"
    } else {
        $Name = "${Name}_$Timestamp"
    }
    
    $BackupPath = Join-Path $BackupDir $Name
    
    Write-Host "`n=== Creating Backup ===" -ForegroundColor Cyan
    Write-Host "Name: $Name" -ForegroundColor Yellow
    
    New-Item -ItemType Directory -Path $BackupPath | Out-Null
    
    $Items = @("src", "public", "package.json", "package-lock.json", "astro.config.mjs", "tailwind.config.js", "tsconfig.json")
    
    foreach ($Item in $Items) {
        $SourcePath = Join-Path $AppDir $Item
        if (Test-Path $SourcePath) {
            $DestPath = Join-Path $BackupPath $Item
            Copy-Item -Path $SourcePath -Destination $DestPath -Recurse -Force
            Write-Host "  [OK] $Item" -ForegroundColor Green
        }
    }
    
    # Save metadata
    $Meta = @{
        name = $Name
        date = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        path = $BackupPath
    }
    
    $Meta | ConvertTo-Json | Set-Content (Join-Path $BackupPath "backup-info.json")
    
    Write-Host "`n[SUCCESS] Backup created!" -ForegroundColor Green
    Write-Host "Location: $BackupPath`n" -ForegroundColor Gray
}

function Restore-Backup {
    param($Name)
    
    $Backup = Get-ChildItem $BackupDir -Directory | 
        Where-Object { $_.Name -like "*$Name*" } | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
    
    if (-not $Backup) {
        Write-Host "[ERROR] Backup not found: $Name" -ForegroundColor Red
        return
    }
    
    Write-Host "`n=== Restore Backup ===" -ForegroundColor Cyan
    Write-Host "From: $($Backup.Name)" -ForegroundColor Yellow
    Write-Host "`n[WARNING] This will overwrite current files!" -ForegroundColor Yellow
    
    $Confirm = Read-Host "Type YES to continue"
    if ($Confirm -ne 'YES') {
        Write-Host "Cancelled" -ForegroundColor Gray
        return
    }
    
    # Safety backup
    Write-Host "`nCreating safety backup..." -ForegroundColor Cyan
    Create-Backup "before_restore"
    
    # Restore
    Write-Host "`nRestoring files..." -ForegroundColor Cyan
    $Items = Get-ChildItem $Backup.FullName -Exclude "backup-info.json"
    
    foreach ($Item in $Items) {
        $DestPath = Join-Path $AppDir $Item.Name
        if (Test-Path $DestPath) {
            Remove-Item $DestPath -Recurse -Force
        }
        Copy-Item -Path $Item.FullName -Destination $DestPath -Recurse -Force
        Write-Host "  [OK] $($Item.Name)" -ForegroundColor Green
    }
    
    Write-Host "`n[SUCCESS] Restore completed!" -ForegroundColor Green
    Write-Host "Run 'npm install' to update dependencies`n" -ForegroundColor Yellow
}

function List-Backups {
    $Backups = Get-ChildItem $BackupDir -Directory | Sort-Object LastWriteTime -Descending
    
    Write-Host "`n=== Available Backups ===" -ForegroundColor Cyan
    Write-Host "Total: $($Backups.Count)`n" -ForegroundColor Gray
    
    foreach ($Backup in $Backups) {
        $InfoFile = Join-Path $Backup.FullName "backup-info.json"
        
        Write-Host $Backup.Name -ForegroundColor Yellow
        
        if (Test-Path $InfoFile) {
            $Info = Get-Content $InfoFile | ConvertFrom-Json
            Write-Host "  Created: $($Info.date)" -ForegroundColor Gray
        } else {
            Write-Host "  Created: $($Backup.LastWriteTime)" -ForegroundColor Gray
        }
        
        $Size = (Get-ChildItem $Backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  Size: $([math]::Round($Size, 2)) MB`n" -ForegroundColor Gray
    }
}

# Execute action
switch ($Action) {
    'backup' { Create-Backup $BackupName }
    'restore' { Restore-Backup $BackupName }
    'list' { List-Backups }
}
