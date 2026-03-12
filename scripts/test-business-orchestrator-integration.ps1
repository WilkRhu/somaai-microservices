#!/usr/bin/env pwsh

# Business Service & Orchestrator Integration Test Script
# Tests both direct Business Service routes and Orchestrator proxy routes

$BUSINESS_SERVICE_URL = "http://localhost:3011"
$ORCHESTRATOR_URL = "http://localhost:3009"
$BUSINESS_API_PATH = "/api/business"

# Colors for output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$RESET = "`e[0m"

function Test-Service {
    param(
        [string]$ServiceName,
        [string]$Url
    )
    
    Write-Host "`n$YELLOW=== Testing $ServiceName ===$RESET"
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/docs" -Method GET -ErrorAction Stop
        Write-Host "$GREEN✓ $ServiceName is running$RESET"
        return $true
    } catch {
        Write-Host "$RED✗ $ServiceName is not responding$RESET"
        Write-Host "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-DirectBusinessService {
    Write-Host "`n$YELLOW=== Testing Direct Business Service Routes ===$RESET"
    
    # Test Establishment Creation
    Write-Host "`nTesting: POST /api/establishments"
    try {
        $establishmentData = @{
            name = "Test Establishment Direct"
            cnpj = "12345678000190"
            email = "direct@example.com"
            phone = "1199999999"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$BUSINESS_SERVICE_URL/api/establishments" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $establishmentData `
            -ErrorAction Stop
        
        $result = $response.Content | ConvertFrom-Json
        Write-Host "$GREEN✓ Establishment created: $($result.id)$RESET"
        return $result.id
    } catch {
        Write-Host "$RED✗ Failed to create establishment$RESET"
        Write-Host "Error: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)"
        return $null
    }
}

function Test-OrchestratorProxy {
    Write-Host "`n$YELLOW=== Testing Orchestrator Proxy Routes ===$RESET"
    
    # Test Establishment Creation via Orchestrator
    Write-Host "`nTesting: POST /api/business/establishments"
    try {
        $establishmentData = @{
            name = "Test Establishment via Orchestrator"
            cnpj = "12345678000191"
            email = "orchestrator@example.com"
            phone = "1199999998"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ORCHESTRATOR_URL$BUSINESS_API_PATH/establishments" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $establishmentData `
            -ErrorAction Stop
        
        $result = $response.Content | ConvertFrom-Json
        Write-Host "$GREEN✓ Establishment created via Orchestrator: $($result.id)$RESET"
        return $result.id
    } catch {
        Write-Host "$RED✗ Failed to create establishment via Orchestrator$RESET"
        Write-Host "Error: $($_.Exception.Response.StatusCode) - $($_.Exception.Message)"
        return $null
    }
}

function Test-ListEndpoints {
    param(
        [string]$BaseUrl,
        [string]$PathPrefix = ""
    )
    
    $endpoints = @(
        @{ name = "Establishments"; path = "/establishments" },
        @{ name = "Customers"; path = "/customers" },
        @{ name = "Inventory"; path = "/inventory" },
        @{ name = "Sales"; path = "/sales" },
        @{ name = "Expenses"; path = "/expenses" },
        @{ name = "Suppliers"; path = "/suppliers" },
        @{ name = "Offers"; path = "/offers" }
    )
    
    Write-Host "`n$YELLOW=== Testing List Endpoints ===$RESET"
    
    foreach ($endpoint in $endpoints) {
        try {
            $url = "$BaseUrl/api$PathPrefix$($endpoint.path)"
            $response = Invoke-WebRequest -Uri $url -Method GET -ErrorAction Stop
            Write-Host "$GREEN✓ GET $($endpoint.name)$RESET"
        } catch {
            Write-Host "$RED✗ GET $($endpoint.name) failed$RESET"
        }
    }
}

function Test-CustomerCreation {
    param(
        [string]$BaseUrl,
        [string]$PathPrefix = "",
        [string]$EstablishmentId
    )
    
    Write-Host "`n$YELLOW=== Testing Customer Creation ===$RESET"
    
    try {
        $customerData = @{
            establishmentId = $EstablishmentId
            name = "Test Customer"
            email = "customer@example.com"
            phone = "1188888888"
            cpf = "12345678901"
        } | ConvertTo-Json
        
        $url = "$BaseUrl/api$PathPrefix/customers"
        $response = Invoke-WebRequest -Uri $url `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $customerData `
            -ErrorAction Stop
        
        $result = $response.Content | ConvertFrom-Json
        Write-Host "$GREEN✓ Customer created: $($result.id)$RESET"
        return $result.id
    } catch {
        Write-Host "$RED✗ Failed to create customer$RESET"
        Write-Host "Error: $($_.Exception.Response.StatusCode)"
    }
}

# Main execution
Write-Host "$YELLOW╔════════════════════════════════════════════════════════════╗$RESET"
Write-Host "$YELLOW║  Business Service & Orchestrator Integration Test Suite   ║$RESET"
Write-Host "$YELLOW╚════════════════════════════════════════════════════════════╝$RESET"

# Check if services are running
$businessRunning = Test-Service "Business Service" $BUSINESS_SERVICE_URL
$orchestratorRunning = Test-Service "Orchestrator" $ORCHESTRATOR_URL

if (-not $businessRunning -or -not $orchestratorRunning) {
    Write-Host "`n$RED✗ One or more services are not running. Please start them first.$RESET"
    exit 1
}

# Test direct Business Service
$directEstablishmentId = Test-DirectBusinessService

# Test Orchestrator Proxy
$orchestratorEstablishmentId = Test-OrchestratorProxy

# Test list endpoints
if ($directEstablishmentId) {
    Test-ListEndpoints $BUSINESS_SERVICE_URL ""
}

if ($orchestratorEstablishmentId) {
    Test-ListEndpoints $ORCHESTRATOR_URL $BUSINESS_API_PATH
}

# Test customer creation
if ($directEstablishmentId) {
    Test-CustomerCreation $BUSINESS_SERVICE_URL "" $directEstablishmentId
}

if ($orchestratorEstablishmentId) {
    Test-CustomerCreation $ORCHESTRATOR_URL $BUSINESS_API_PATH $orchestratorEstablishmentId
}

Write-Host "`n$YELLOW╔════════════════════════════════════════════════════════════╗$RESET"
Write-Host "$YELLOW║  Integration Test Complete                                 ║$RESET"
Write-Host "$YELLOW╚════════════════════════════════════════════════════════════╝$RESET"
