Write-Host "Testing Notifications Service" -ForegroundColor Yellow
Write-Host ""

# Test health
Write-Host "1. Testing Health Endpoint" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3011/health" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json
Write-Host ""

# Test send email
Write-Host "2. Testing Send Email" -ForegroundColor Yellow
$body = @{
    to = "test@example.com"
    subject = "Test Email"
    template = "user-welcome"
    data = @{
        userName = "Test User"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3011/notifications/email/send" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json
Write-Host ""

# Test send notification
Write-Host "3. Testing Send Notification" -ForegroundColor Yellow
$body = @{
    userId = "test-user-123"
    type = "email"
    title = "Test Notification"
    message = "<h1>Test</h1>"
    recipient = "test@example.com"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3011/notifications/send" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json
Write-Host ""

# Test get preferences
Write-Host "4. Testing Get Preferences" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3011/notifications/preferences/test-user-123" -Method Get
$response.Content | ConvertFrom-Json | ConvertTo-Json
Write-Host ""

# Test update preferences
Write-Host "5. Testing Update Preferences" -ForegroundColor Yellow
$body = @{
    emailEnabled = $true
    smsEnabled = $false
    pushEnabled = $true
    marketingEmails = $false
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3011/notifications/preferences/test-user-123" `
    -Method Put `
    -ContentType "application/json" `
    -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json
Write-Host ""

Write-Host "Tests completed!" -ForegroundColor Green
