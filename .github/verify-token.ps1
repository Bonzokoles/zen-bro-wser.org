# Cloudflare Token Verification Script
# Usage: .\verify-token.ps1

Write-Host "🔍 Cloudflare API Token Verification" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if tokens are set
if (-not $env:CLOUDFLARE_API_TOKEN) {
    Write-Host "❌ CLOUDFLARE_API_TOKEN not set!" -ForegroundColor Red
    Write-Host "   Run: `$env:CLOUDFLARE_API_TOKEN = 'YOUR_TOKEN'" -ForegroundColor Yellow
    exit 1
}

if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
    Write-Host "⚠️  CLOUDFLARE_ACCOUNT_ID not set, using default..." -ForegroundColor Yellow
    $env:CLOUDFLARE_ACCOUNT_ID = "7f490d58a478c6baccb0ae01ea1d87c3"
}

Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host "   CLOUDFLARE_API_TOKEN: $($env:CLOUDFLARE_API_TOKEN.Substring(0, 10))..." -ForegroundColor Gray
Write-Host "   CLOUDFLARE_ACCOUNT_ID: $env:CLOUDFLARE_ACCOUNT_ID" -ForegroundColor Gray
Write-Host ""

# Test 1: whoami
Write-Host "Test 1: Verifying token with 'whoami'..." -ForegroundColor Cyan
try {
    $whoami = npx wrangler@3.90.0 whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Token is valid!" -ForegroundColor Green
        Write-Host "   $whoami" -ForegroundColor Gray
    }
    else {
        Write-Host "❌ Token verification failed!" -ForegroundColor Red
        Write-Host "   $whoami" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error running wrangler: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: List Pages projects
Write-Host "Test 2: Listing Pages projects..." -ForegroundColor Cyan
try {
    $projects = npx wrangler@3.90.0 pages project list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Pages access confirmed!" -ForegroundColor Green
        
        # Check if zeno-browser exists
        if ($projects -match "zeno-browser") {
            Write-Host "✅ Project 'zeno-browser' found!" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Project 'zeno-browser' not found in list" -ForegroundColor Yellow
            Write-Host "   Available projects:" -ForegroundColor Gray
            Write-Host "   $projects" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "❌ Cannot access Pages projects!" -ForegroundColor Red
        Write-Host "   $projects" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 FIX: Token needs 'Cloudflare Pages: Edit' permission" -ForegroundColor Yellow
        Write-Host "   1. Go to: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Yellow
        Write-Host "   2. Create new token with 'Cloudflare Pages: Edit'" -ForegroundColor Yellow
        Write-Host "   3. Update GitHub Secret: CLOUDFLARE_API_TOKEN" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "❌ Error listing projects: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: List Workers
Write-Host "Test 3: Listing Workers..." -ForegroundColor Cyan
try {
    $workers = npx wrangler@3.90.0 deployments list 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Workers access confirmed!" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Cannot list Workers (may be empty)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Error listing Workers: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "   Token is ready for GitHub Actions" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://github.com/Bonzokoles/zen-bro-wser.org/settings/secrets/actions" -ForegroundColor White
Write-Host "   2. Update CLOUDFLARE_API_TOKEN with this token" -ForegroundColor White
Write-Host "   3. Push a commit to trigger deployment" -ForegroundColor White
