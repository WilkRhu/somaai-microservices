# Run all services locally

Write-Host "Starting all services locally..." -ForegroundColor Green
Write-Host "Make sure you have MySQL, Redis, and Kafka running!" -ForegroundColor Yellow

$services = @(
    @{ name = "auth"; port = 3000; path = "services/auth" },
    @{ name = "orchestrator"; port = 3009; path = "services/orchestrator" },
    @{ name = "business"; port = 3011; path = "services/business" },
    @{ name = "sales"; port = 3001; path = "services/sales" },
    @{ name = "inventory"; port = 3002; path = "services/inventory" },
    @{ name = "delivery"; port = 3003; path = "services/delivery" },
    @{ name = "suppliers"; port = 3004; path = "services/suppliers" },
    @{ name = "offers"; port = 3005; path = "services/offers" },
    @{ name = "fiscal"; port = 3006; path = "services/fiscal" },
    @{ name = "ocr"; port = 3007; path = "services/ocr" },
    @{ name = "payments"; port = 3008; path = "services/payments" },
    @{ name = "monolith"; port = 3010; path = "services/monolith" }
)

Write-Host "`nStarting services..." -ForegroundColor Cyan

foreach ($service in $services) {
    $serviceName = $service.name
    $servicePath = $service.path
    $port = $service.port
    
    Write-Host "Starting $serviceName on port $port..." -ForegroundColor Yellow
    
    # Start in new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$servicePath'; npm run start:dev" -WindowStyle Normal
    
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host "`nServices running on:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  - $($service.name): http://localhost:$($service.port)" -ForegroundColor Green
}
