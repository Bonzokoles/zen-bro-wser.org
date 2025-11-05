# Webhook Testing Script
# Tests complete payment flow: Checkout → Payment → Webhook → API Key

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  WEBHOOK FLOW TEST - ZENO Browser" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Generate test user data
$userId = "test-user-$(Get-Random -Minimum 1000 -Maximum 9999)"
$email = "test-$(Get-Random -Minimum 100 -Maximum 999)@zeno-test.com"

Write-Host "Test User:" -ForegroundColor Yellow
Write-Host "  User ID: $userId" -ForegroundColor White
Write-Host "  Email: $email" -ForegroundColor White

# Step 1: Create Checkout Session
Write-Host "`n[STEP 1] Creating Checkout Session..." -ForegroundColor Green

$checkoutBody = @{
    priceId = "price_1SPy7sRtD21KYuw9U9XFnLRz"  # Monthly plan
    userId  = $userId
    plan    = "monthly"
    email   = $email
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://zeno-browser-api.stolarnia-ams.workers.dev/api/checkout" `
        -Method POST `
        -Body $checkoutBody `
        -ContentType "application/json"
    
    Write-Host "✅ Checkout session created!" -ForegroundColor Green
    Write-Host "   Session ID: $($response.sessionId)" -ForegroundColor Gray
    
    # Step 2: Display Payment URL
    Write-Host "`n[STEP 2] Payment URL Ready" -ForegroundColor Green
    Write-Host "`nOpen this URL in browser:" -ForegroundColor Yellow
    Write-Host $response.url -ForegroundColor Cyan
    
    Write-Host "`n📝 Test Card:" -ForegroundColor Yellow
    Write-Host "   Number: 4242 4242 4242 4242" -ForegroundColor White
    Write-Host "   Date: Any future date (e.g., 12/25)" -ForegroundColor White
    Write-Host "   CVC: Any 3 digits (e.g., 123)" -ForegroundColor White
    Write-Host "   ZIP: Any 5 digits (e.g., 12345)" -ForegroundColor White
    
    # Save session info
    $sessionInfo = @{
        userId      = $userId
        email       = $email
        sessionId   = $response.sessionId
        checkoutUrl = $response.url
        timestamp   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $sessionInfo | ConvertTo-Json | Out-File "V:\PROTO_TYpy\ZENO_web_CORE\.cloudflare\last-test-session.json"
    
    # Step 3: Wait for payment
    Write-Host "`n[STEP 3] Waiting for payment..." -ForegroundColor Green
    Write-Host "Press ENTER after completing payment in browser..." -ForegroundColor Yellow
    Read-Host
    
    # Step 4: Check if API key was generated
    Write-Host "`n[STEP 4] Checking API Key Generation..." -ForegroundColor Green
    
    # Wait a bit for webhook to process
    Start-Sleep -Seconds 3
    
    Write-Host "`nTo verify API key was created, run:" -ForegroundColor Yellow
    Write-Host "wrangler kv:key list --binding=CACHE --prefix=apikey:" -ForegroundColor Cyan
    
    Write-Host "`nOr check webhook events in Stripe Dashboard:" -ForegroundColor Yellow
    Write-Host "https://dashboard.stripe.com/test/webhooks" -ForegroundColor Cyan
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  TEST INITIATED - CHECK RESULTS" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Session info saved to: last-test-session.json" -ForegroundColor Gray
    
}
catch {
    Write-Host "`n❌ Error creating checkout session:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
