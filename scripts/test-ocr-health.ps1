# Test OCR Service Health

Write-Host "Testing OCR Service Health..." -ForegroundColor Green
Write-Host ""

# Test health endpoint
Write-Host "1. Testing OCR Health Endpoint (http://localhost:3007/api/ocr/health)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3007/api/ocr/health" `
        -Method GET `
        -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test main health endpoint
Write-Host "2. Testing Main Health Endpoint (http://localhost:3007/health)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3007/health" `
        -Method GET `
        -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Test Swagger docs
Write-Host "3. Testing Swagger Docs (http://localhost:3007/api/docs)" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3007/api/docs" `
        -Method GET `
        -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Swagger docs available"
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
