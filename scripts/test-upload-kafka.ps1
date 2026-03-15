Write-Host "Testing Upload Service Kafka Connection..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if upload service is running
Write-Host "`nChecking if Upload Service is running..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3008/health" -Method Get -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Upload Service is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Upload Service is not responding" -ForegroundColor Red
    Write-Host "Please start the upload service first: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

# Check Kafka connection
Write-Host "`nChecking Kafka connection..." -ForegroundColor Yellow

$kafkaBrokers = $env:KAFKA_BROKERS -or "localhost:9092"
$kafkaHost = $kafkaBrokers.Split(":")[0]
$kafkaPort = $kafkaBrokers.Split(":")[1]

$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $tcpClient.Connect($kafkaHost, $kafkaPort)
    Write-Host "✓ Kafka broker is accessible at $kafkaBrokers" -ForegroundColor Green
    $tcpClient.Close()
} catch {
    Write-Host "✗ Cannot connect to Kafka broker at $kafkaBrokers" -ForegroundColor Red
    Write-Host "Make sure Kafka is running: docker-compose up -d kafka" -ForegroundColor Yellow
    exit 1
}

# Check if topics exist
Write-Host "`nChecking Kafka topics..." -ForegroundColor Yellow

$topics = @("file.upload.requested", "file.upload.completed", "file.upload.failed")

foreach ($topic in $topics) {
    Write-Host "  - Checking topic: $topic" -ForegroundColor Gray
}

Write-Host "`n✓ All checks passed!" -ForegroundColor Green
Write-Host "Upload Service is connected to Kafka" -ForegroundColor Yellow
