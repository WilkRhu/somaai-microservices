# Test User Sync Script

$AUTH_URL = "http://localhost:3010"
$MONOLITH_URL = "http://localhost:3000"

Write-Host "=== User Sync Test ===" -ForegroundColor Yellow
Write-Host ""

# Step 1: Register user
Write-Host "Step 1: Registering user..." -ForegroundColor Yellow

$registerBody = @{
    email = "synctest@example.com"
    password = "Test@123456"
    firstName = "Sync"
    lastName = "Test"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$AUTH_URL/api/auth/register" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $registerBody

    $registerData = $registerResponse.Content | ConvertFrom-Json
    $USER_ID = $registerData.user.id

    Write-Host "✓ User registered: $USER_ID" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check if user exists in monolith
Write-Host "Step 2: Checking if user exists in monolith..." -ForegroundColor Yellow

try {
    $checkResponse = Invoke-WebRequest -Uri "$MONOLITH_URL/api/users/internal/check/$USER_ID" `
        -Method GET `
        -Headers @{
            "X-Internal-Service" = "auth-service"
        }

    $checkData = $checkResponse.Content | ConvertFrom-Json
    Write-Host "✓ User exists in monolith" -ForegroundColor Green
    Write-Host "Response: $($checkData | ConvertTo-Json)" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✗ User NOT found in monolith (404)" -ForegroundColor Red
        Write-Host "This means the sync from auth to monolith failed!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Check auth service logs for sync errors" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Error checking user: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
    exit 1
}

Write-Host ""
Write-Host "=== Test completed ===" -ForegroundColor Green
