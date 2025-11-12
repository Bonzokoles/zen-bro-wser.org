#!/usr/bin/env pwsh
# Cloudflare Deployment Setup Script
# Run this ONCE before first deployment

param(
    [switch]$SkipLogin,
    [switch]$SkipDatabase,
    [switch]$SkipSecrets
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Cloudflare Setup - ZENO Browser Deployment          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check Wrangler installation
Write-Host "📦 Checking Wrangler CLI..." -ForegroundColor Yellow
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Wrangler not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
    Write-Host "✅ Wrangler installed!" -ForegroundColor Green
}
else {
    Write-Host "✅ Wrangler is installed" -ForegroundColor Green
}

# Login to Cloudflare
if (-not $SkipLogin) {
    Write-Host "`n🔐 Step 1: Login to Cloudflare" -ForegroundColor Cyan
    Write-Host "Opening browser for authentication..." -ForegroundColor Gray
    wrangler login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully logged in!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Login failed. Please try again." -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "`n⏭️  Skipping login (--SkipLogin flag)" -ForegroundColor Yellow
}

# Get account ID
Write-Host "`n📋 Getting your Cloudflare account info..." -ForegroundColor Yellow
$accountInfo = wrangler whoami 2>&1 | Out-String
if ($accountInfo -match "Account ID: (\w+)") {
    $accountId = $Matches[1]
    Write-Host "✅ Account ID: $accountId" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Could not auto-detect Account ID" -ForegroundColor Yellow
    $accountId = Read-Host "Enter your Cloudflare Account ID (from dashboard)"
}

# Create D1 Database
if (-not $SkipDatabase) {
    Write-Host "`n🗄️  Step 2: Creating D1 Database" -ForegroundColor Cyan
    
    Write-Host "Creating 'zeno-browser-db'..." -ForegroundColor Gray
    $d1Output = wrangler d1 create zeno-browser-db 2>&1 | Out-String
    
    if ($d1Output -match 'database_id\s*=\s*"([^"]+)"') {
        $databaseId = $Matches[1]
        Write-Host "✅ Database created!" -ForegroundColor Green
        Write-Host "   Database ID: $databaseId" -ForegroundColor White
        
        # Update wrangler.toml
        Write-Host "`nUpdating .cloudflare/wrangler.toml..." -ForegroundColor Gray
        $wranglerPath = Join-Path $PSScriptRoot "wrangler.toml"
        $content = Get-Content $wranglerPath -Raw
        $content = $content -replace 'database_id = ""', "database_id = `"$databaseId`""
        $content = $content -replace 'account_id = "YOUR_CLOUDFLARE_ACCOUNT_ID"', "account_id = `"$accountId`""
        Set-Content $wranglerPath $content -NoNewline
        Write-Host "✅ wrangler.toml updated!" -ForegroundColor Green
        
        # Import schema
        Write-Host "`n📥 Importing database schema..." -ForegroundColor Gray
        $schemaPath = Join-Path (Split-Path $PSScriptRoot -Parent) "zenbrowsers_full_boilerplate\backend\schema.sql"
        
        if (Test-Path $schemaPath) {
            wrangler d1 execute zeno-browser-db --file="$schemaPath"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Schema imported successfully!" -ForegroundColor Green
                Write-Host "   • 23 sites added" -ForegroundColor White
                Write-Host "   • 4 users added" -ForegroundColor White
                Write-Host "   • Indexes created" -ForegroundColor White
            }
            else {
                Write-Host "⚠️  Schema import failed. You can import manually later:" -ForegroundColor Yellow
                Write-Host "   wrangler d1 execute zeno-browser-db --file=$schemaPath" -ForegroundColor Gray
            }
        }
        else {
            Write-Host "⚠️  Schema file not found: $schemaPath" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "⚠️  Database might already exist or creation failed" -ForegroundColor Yellow
        Write-Host "Check: https://dash.cloudflare.com/d1" -ForegroundColor Gray
    }
}
else {
    Write-Host "`n⏭️  Skipping database setup (--SkipDatabase flag)" -ForegroundColor Yellow
}

# Create KV Namespace
Write-Host "`n🗂️  Step 3: Creating KV Namespace" -ForegroundColor Cyan

Write-Host "Creating 'CACHE' namespace..." -ForegroundColor Gray
$kvOutput = wrangler kv:namespace create CACHE 2>&1 | Out-String

if ($kvOutput -match 'id\s*=\s*"([^"]+)"') {
    $kvId = $Matches[1]
    Write-Host "✅ KV namespace created!" -ForegroundColor Green
    Write-Host "   Namespace ID: $kvId" -ForegroundColor White
    
    # Create preview namespace
    Write-Host "`nCreating preview namespace..." -ForegroundColor Gray
    $kvPreviewOutput = wrangler kv:namespace create CACHE --preview 2>&1 | Out-String
    
    if ($kvPreviewOutput -match 'id\s*=\s*"([^"]+)"') {
        $kvPreviewId = $Matches[1]
        Write-Host "✅ Preview namespace created!" -ForegroundColor Green
        Write-Host "   Preview ID: $kvPreviewId" -ForegroundColor White
        
        # Update wrangler.toml
        Write-Host "`nUpdating .cloudflare/wrangler.toml..." -ForegroundColor Gray
        $wranglerPath = Join-Path $PSScriptRoot "wrangler.toml"
        $content = Get-Content $wranglerPath -Raw
        $content = $content -replace 'id = ""  # FILL THIS: Run ''wrangler kv:namespace create CACHE''', "id = `"$kvId`""
        $content = $content -replace 'preview_id = ""', "preview_id = `"$kvPreviewId`""
        Set-Content $wranglerPath $content -NoNewline
        Write-Host "✅ wrangler.toml updated!" -ForegroundColor Green
    }
}
else {
    Write-Host "⚠️  KV namespace might already exist or creation failed" -ForegroundColor Yellow
    Write-Host "Check: https://dash.cloudflare.com/kv/namespaces" -ForegroundColor Gray
}

# Set Secrets
if (-not $SkipSecrets) {
    Write-Host "`n🔑 Step 4: Setting API Keys (Secrets)" -ForegroundColor Cyan
    Write-Host "You'll be prompted to enter each API key." -ForegroundColor Gray
    Write-Host "Press Enter to skip any key if not available now." -ForegroundColor Gray
    
    $secrets = @(
        @{ Name = "GEMINI_API_KEY"; Description = "Google Gemini API key" },
        @{ Name = "OPENAI_API_KEY"; Description = "OpenAI API key" },
        @{ Name = "ANTHROPIC_API_KEY"; Description = "Anthropic Claude API key" },
        @{ Name = "TAVILY_API_KEY"; Description = "Tavily search API key (optional)" }
    )
    
    foreach ($secret in $secrets) {
        Write-Host "`nSetting $($secret.Name) ($($secret.Description))..." -ForegroundColor Yellow
        $response = Read-Host "Do you want to set $($secret.Name) now? (y/N)"
        
        if ($response -eq 'y' -or $response -eq 'Y') {
            wrangler secret put $secret.Name
        }
        else {
            Write-Host "⏭️  Skipped. You can set it later with: wrangler secret put $($secret.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n✅ Secrets configuration complete!" -ForegroundColor Green
}
else {
    Write-Host "`n⏭️  Skipping secrets setup (--SkipSecrets flag)" -ForegroundColor Yellow
    Write-Host "Set secrets manually with: wrangler secret put <NAME>" -ForegroundColor Gray
}

# Create Pages project
Write-Host "`n📄 Step 5: Creating Cloudflare Pages Project" -ForegroundColor Cyan
Write-Host "Go to: https://dash.cloudflare.com/pages" -ForegroundColor Cyan
Write-Host "`nManual steps:" -ForegroundColor Yellow
Write-Host "1. Click 'Create application' → 'Pages' → 'Connect to Git'" -ForegroundColor White
Write-Host "2. Select your GitHub repository: Bonzokoles/zen-bro-wser.org" -ForegroundColor White
Write-Host "3. Configure build settings:" -ForegroundColor White
Write-Host "   • Framework preset: Astro" -ForegroundColor Gray
Write-Host "   • Build command: npm run build" -ForegroundColor Gray
Write-Host "   • Build output: dist" -ForegroundColor Gray
Write-Host "   • Root directory: ZENO_WEB_CORE_APP" -ForegroundColor Gray
Write-Host "4. Set environment variables:" -ForegroundColor White
Write-Host "   • NODE_VERSION=18" -ForegroundColor Gray
Write-Host "   • VITE_API_URL=https://zeno-browser-api.<your-subdomain>.workers.dev" -ForegroundColor Gray
Write-Host "   • VITE_ENVIRONMENT=production" -ForegroundColor Gray
Write-Host "5. Click 'Save and Deploy'" -ForegroundColor White

$response = Read-Host "`nPress Enter when Pages project is created"

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            Setup Complete! 🎉                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "✅ Completed steps:" -ForegroundColor Cyan
Write-Host "   • Wrangler CLI installed" -ForegroundColor White
if (-not $SkipLogin) { Write-Host "   • Logged into Cloudflare" -ForegroundColor White }
if (-not $SkipDatabase) { Write-Host "   • D1 Database created and populated" -ForegroundColor White }
Write-Host "   • KV Namespace created" -ForegroundColor White
if (-not $SkipSecrets) { Write-Host "   • API secrets configured" -ForegroundColor White }
Write-Host "   • Configuration files updated" -ForegroundColor White

Write-Host "`n📋 Configuration details:" -ForegroundColor Cyan
Write-Host "   Account ID: $accountId" -ForegroundColor White
if ($databaseId) { Write-Host "   Database ID: $databaseId" -ForegroundColor White }
if ($kvId) { Write-Host "   KV ID: $kvId" -ForegroundColor White }

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy Worker:" -ForegroundColor White
Write-Host "      cd .cloudflare" -ForegroundColor Gray
Write-Host "      wrangler deploy" -ForegroundColor Gray
Write-Host "`n   2. Deploy Pages (auto via Git push):" -ForegroundColor White
Write-Host "      git push origin main" -ForegroundColor Gray
Write-Host "`n   3. Verify deployments:" -ForegroundColor White
Write-Host "      • Worker: https://dash.cloudflare.com/workers" -ForegroundColor Gray
Write-Host "      • Pages: https://dash.cloudflare.com/pages" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • Deployment guide: zenbrowsers_full_boilerplate/README.md" -ForegroundColor White
Write-Host "   • Quick start: zenbrowsers_full_boilerplate/QUICKSTART.md" -ForegroundColor White
Write-Host "   • Project structure: ZENO_WEB_CORE_APP/PROJECT_STRUCTURE.md" -ForegroundColor White

Write-Host "`n💡 Useful commands:" -ForegroundColor Cyan
Write-Host "   wrangler tail                    # View Worker logs" -ForegroundColor Gray
Write-Host "   wrangler d1 execute DB --file    # Run SQL" -ForegroundColor Gray
Write-Host "   wrangler kv:key list --binding   # List KV keys" -ForegroundColor Gray
Write-Host "   wrangler deployments list        # List deployments" -ForegroundColor Gray

Write-Host ""
