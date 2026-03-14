# Test OCR Extract Base64 endpoint

Write-Host "Testing OCR Extract Base64 endpoint..." -ForegroundColor Green
Write-Host ""

# Simple 1x1 pixel PNG in base64
$BASE64_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

$body = @{
    imageBase64 = $BASE64_IMAGE
    documentType = "receipt"
    language = "por"
} | ConvertTo-Json

# Test on Orchestrator (port 3009)
Write-Host "1. Testing on Orchestrator (http://localhost:3009/api/monolith/ocr/extract-base64)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3009/api/monolith/ocr/extract-base64" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test on OCR Service (port 3007)
Write-Host "2. Testing on OCR Service (http://localhost:3007/api/ocr/extract-base64)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3007/api/ocr/extract-base64" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test on Monolith (port 3000)
Write-Host "3. Testing on Monolith (http://localhost:3000/api/monolith/ocr/extract-base64)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/monolith/ocr/extract-base64" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $body
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
