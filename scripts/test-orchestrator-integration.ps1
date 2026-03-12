#!/usr/bin/env pwsh

# Colors for output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$NC = "`e[0m"

$ORCHESTRATOR_URL = "http://localhost:3009"
$BUSINESS_SERVICE_URL = "http://localhost:3011"

Write-Host "${BLUE}Testing Orchestrator Integration with Business Service${NC}`n"

# Test 1: Create Establishment via Orchestrator
Write-Host "${YELLOW}1. Creating Establishment via Orchestrator...${NC}"
$establishmentBody = @{
    name = "Loja Integrada"
    cnpj = "11111111000190"
    ownerId = "user-123"
    type = "RETAIL"
    address = "Rua Integrada, 100"
    city = "Sao Paulo"
    state = "SP"
    zipCode = "01310-100"
    phone = "1133334444"
    email = "loja@integrada.com"
} | ConvertTo-Json

$establishment = Invoke-RestMethod -Uri "$ORCHESTRATOR_URL/api/business/establishments" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $establishmentBody

$ESTABLISHMENT_ID = $establishment.id

if (-not $ESTABLISHMENT_ID) {
    Write-Host "${RED}Failed to create establishment via Orchestrator${NC}"
    Write-Host $establishment
    exit 1
}

Write-Host "${GREEN}Establishment created via Orchestrator: $ESTABLISHMENT_ID${NC}`n"

# Test 2: Verify via Direct Business Service
Write-Host "${YELLOW}2. Verifying via Direct Business Service...${NC}"
$directEstablishment = Invoke-RestMethod -Uri "$BUSINESS_SERVICE_URL/api/establishments/$ESTABLISHMENT_ID" -Method GET

if ($directEstablishment.id -eq $ESTABLISHMENT_ID) {
    Write-Host "${GREEN}Verified: Establishment exists in Business Service${NC}`n"
} else {
    Write-Host "${RED}Failed to verify establishment${NC}"
    exit 1
}

# Test 3: Create Customer via Orchestrator
Write-Host "${YELLOW}3. Creating Customer via Orchestrator...${NC}"
$customerBody = @{
    establishmentId = $ESTABLISHMENT_ID
    name = "Cliente Integrado"
    cpf = "11111111900"
    email = "cliente@integrada.com"
    phone = "11988888888"
} | ConvertTo-Json

$customer = Invoke-RestMethod -Uri "$ORCHESTRATOR_URL/api/business/customers" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $customerBody

$CUSTOMER_ID = $customer.id

if (-not $CUSTOMER_ID) {
    Write-Host "${RED}Failed to create customer via Orchestrator${NC}"
    Write-Host $customer
    exit 1
}

Write-Host "${GREEN}Customer created via Orchestrator: $CUSTOMER_ID${NC}`n"

# Test 4: List Establishments via Orchestrator
Write-Host "${YELLOW}4. Listing Establishments via Orchestrator...${NC}"
$establishments = Invoke-RestMethod -Uri "$ORCHESTRATOR_URL/api/business/establishments" -Method GET
$count = $establishments.Count
Write-Host "${GREEN}Found $count establishment(s) via Orchestrator${NC}`n"

# Test 5: Create Inventory Item via Orchestrator
Write-Host "${YELLOW}5. Creating Inventory Item via Orchestrator...${NC}"
$itemBody = @{
    establishmentId = $ESTABLISHMENT_ID
    barcode = "1111111111111"
    name = "Produto Integrado"
    category = "Eletronicos"
    brand = "Brand Integrado"
    costPrice = 50.00
    salePrice = 99.90
    quantity = 100
    minQuantity = 10
    unit = "UN"
    description = "Produto de teste integrado"
} | ConvertTo-Json

$item = Invoke-RestMethod -Uri "$ORCHESTRATOR_URL/api/business/inventory" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $itemBody

$ITEM_ID = $item.id

if (-not $ITEM_ID) {
    Write-Host "${RED}Failed to create inventory item via Orchestrator${NC}"
    Write-Host $item
    exit 1
}

Write-Host "${GREEN}Inventory item created via Orchestrator: $ITEM_ID${NC}`n"

# Test 6: Create Sale via Orchestrator
Write-Host "${YELLOW}6. Creating Sale via Orchestrator...${NC}"
$saleBody = @{
    establishmentId = $ESTABLISHMENT_ID
    customerId = $CUSTOMER_ID
    saleNumber = "SALE-INTEGRADO-001"
    subtotal = 299.70
    discount = 0
    total = 299.70
    status = "COMPLETED"
    paymentMethod = "CARD"
    sellerId = "seller-123"
    notes = "Venda integrada"
} | ConvertTo-Json

$sale = Invoke-RestMethod -Uri "$ORCHESTRATOR_URL/api/business/sales" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $saleBody

$SALE_ID = $sale.id

if (-not $SALE_ID) {
    Write-Host "${RED}Failed to create sale via Orchestrator${NC}"
    Write-Host $sale
    exit 1
}

Write-Host "${GREEN}Sale created via Orchestrator: $SALE_ID${NC}`n"

# Summary
Write-Host "${BLUE}Integration Test Summary${NC}"
Write-Host "${GREEN}All tests passed!${NC}`n"

Write-Host "Created via Orchestrator:"
Write-Host "  Establishment: $ESTABLISHMENT_ID"
Write-Host "  Customer: $CUSTOMER_ID"
Write-Host "  Inventory Item: $ITEM_ID"
Write-Host "  Sale: $SALE_ID"

Write-Host "`n${BLUE}Orchestrator Integration is working correctly!${NC}"
Write-Host "Frontend can now access Business Service through Orchestrator at http://localhost:3009/api/business/*"
