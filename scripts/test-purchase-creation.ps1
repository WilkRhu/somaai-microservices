# Purchase Creation Test Script

# Configuration
$AUTH_URL = "http://localhost:3010"
$ORCHESTRATOR_URL = "http://localhost:3009"
$MONOLITH_URL = "http://localhost:3000"

# Test credentials
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "Test@123456"

Write-Host "=== Purchase Creation Test ===" -ForegroundColor Yellow
Write-Host ""

# Step 1: Register user
Write-Host "Step 1: Registering user..." -ForegroundColor Yellow

$registerBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri "$AUTH_URL/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $registerBody

$registerData = $registerResponse.Content | ConvertFrom-Json

Write-Host "Response:" -ForegroundColor Cyan
$registerData | ConvertTo-Json | Write-Host

# Extract token and user ID
$ACCESS_TOKEN = $registerData.accessToken
$USER_ID = $registerData.user.id

if (-not $ACCESS_TOKEN) {
    Write-Host "Failed to get access token" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Got access token: $($ACCESS_TOKEN.Substring(0, 20))..." -ForegroundColor Green
Write-Host "✓ User ID: $USER_ID" -ForegroundColor Green
Write-Host ""

# Step 2: Create purchase via orchestrator
Write-Host "Step 2: Creating purchase via orchestrator..." -ForegroundColor Yellow

$purchasePayload = @{
    type = "market"
    merchant = "Supermercado Extra"
    amount = 150.50
    paymentMethod = "pix"
    purchasedAt = "2026-03-14T17:00:00.000Z"
    description = "Compras da semana"
    items = @(
        @{
            name = "Arroz"
            quantity = 2
            unit = "kg"
            unitPrice = 8.50
        },
        @{
            name = "Feijão"
            quantity = 1
            unit = "kg"
            unitPrice = 12.00
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Payload:" -ForegroundColor Cyan
$purchasePayload | Write-Host

try {
    $purchaseResponse = Invoke-WebRequest -Uri "$ORCHESTRATOR_URL/api/monolith/users/$USER_ID/purchases" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $ACCESS_TOKEN"
        } `
        -Body $purchasePayload

    $purchaseData = $purchaseResponse.Content | ConvertFrom-Json

    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $purchaseData | ConvertTo-Json | Write-Host

    if ($purchaseData.id) {
        Write-Host "✓ Purchase created successfully" -ForegroundColor Green
        $PURCHASE_ID = $purchaseData.id
        Write-Host "✓ Purchase ID: $PURCHASE_ID" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "✗ Failed to create purchase" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Red
    exit 1
}

# Step 3: Get purchase
Write-Host "Step 3: Getting purchase..." -ForegroundColor Yellow

try {
    $getResponse = Invoke-WebRequest -Uri "$ORCHESTRATOR_URL/api/monolith/users/$USER_ID/purchases/$PURCHASE_ID" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $ACCESS_TOKEN"
        }

    $getData = $getResponse.Content | ConvertFrom-Json

    Write-Host "Response:" -ForegroundColor Cyan
    $getData | ConvertTo-Json | Write-Host
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Test completed successfully ===" -ForegroundColor Green
