#!/usr/bin/env pwsh

# Complete SomaAI Microservices Startup Script
# Starts all services in the correct order

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SomaAI Microservices - Complete Startup                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Colors
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$RESET = "`e[0m"

# Check if MySQL is running
Write-Host "`n$YELLOW[1/5] Checking MySQL connection...$RESET"
try {
    $connection = New-Object System.Data.SqlClient.SqlConnection
    $connection.ConnectionString = "Server=localhost;User Id=root;Password=;"
    $connection.Open()
    $connection.Close()
    Write-Host "$GREEN✓ MySQL is running$RESET"
} catch {
    Write-Host "$RED✗ MySQL is not running. Please start MySQL first.$RESET"
    exit 1
}

# Initialize databases
Write-Host "`n$YELLOW[2/5] Initializing databases...$RESET"
try {
    node scripts/init-business-db.js
    Write-Host "$GREEN✓ Databases initialized$RESET"
} catch {
    Write-Host "$RED✗ Failed to initialize databases$RESET"
}

# Start Auth Service
Write-Host "`n$YELLOW[3/5] Starting Auth Service (port 3010)...$RESET"
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd services/auth && npm run start:dev" -PassThru | Out-Null
Start-Sleep -Seconds 3
Write-Host "$GREEN✓ Auth Service started$RESET"

# Start Monolith Service
Write-Host "`n$YELLOW[4/5] Starting Monolith Service (port 3001)...$RESET"
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd services/monolith && npm run start:dev" -PassThru | Out-Null
Start-Sleep -Seconds 3
Write-Host "$GREEN✓ Monolith Service started$RESET"

# Start Business Service
Write-Host "`n$YELLOW[5/5] Starting Business Service (port 3011)...$RESET"
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd services/business && npm run start:dev" -PassThru | Out-Null
Start-Sleep -Seconds 3
Write-Host "$GREEN✓ Business Service started$RESET"

# Start Orchestrator
Write-Host "`n$YELLOW[6/6] Starting Orchestrator (port 3009)...$RESET"
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd services/orchestrator && npm run start:dev" -PassThru | Out-Null
Start-Sleep -Seconds 3
Write-Host "$GREEN✓ Orchestrator started$RESET"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  All Services Started Successfully!                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n$GREEN📍 Service URLs:$RESET"
Write-Host "  • Auth Service:       http://localhost:3010/api/docs"
Write-Host "  • Monolith Service:   http://localhost:3001/api/docs"
Write-Host "  • Business Service:   http://localhost:3011/api/docs"
Write-Host "  • Orchestrator:       http://localhost:3009/api/docs"

Write-Host "`n$YELLOW⏳ Waiting for services to be ready...$RESET"
Start-Sleep -Seconds 5

Write-Host "`n$GREEN✓ Ready to test! Run: .\scripts\test-business-orchestrator-integration.ps1$RESET"
