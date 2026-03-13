# Install dependencies for all services

Write-Host "Installing dependencies for all services..." -ForegroundColor Green

$services = @(
    "auth",
    "business",
    "sales",
    "inventory",
    "delivery",
    "suppliers",
    "offers",
    "fiscal",
    "ocr",
    "payments",
    "monolith",
    "orchestrator"
)

foreach ($service in $services) {
    $servicePath = "services/$service"
    
    if (Test-Path "$servicePath/package.json") {
        Write-Host "`n📦 Installing dependencies for $service..." -ForegroundColor Cyan
        Push-Location $servicePath
        npm install --legacy-peer-deps
        Pop-Location
        Write-Host "✅ $service done" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $service/package.json not found" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All dependencies installed!" -ForegroundColor Green
