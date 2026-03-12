#!/usr/bin/env pwsh

# Colors for output
$GREEN = "`e[32m"
$RED = "`e[31m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$NC = "`e[0m"

$BASE_URL = "http://localhost:3011"

Write-Host "${BLUE}Testing Business Service${NC}`n"

# Test 1: Create Establishment
Write-Host "${YELLOW}1. Creating Establishment...${NC}"
$establishmentBody = @{
    name = "Loja Teste"
    cnpj = "12345678000190"
    ownerId = "user-123"
    type = "RETAIL"
    address = "Rua Teste, 100"
    city = "Sao Paulo"
    state = "SP"
    zipCode = "01310-100"
    phone = "1133334444"
    email = "loja@test.com"
} | ConvertTo-Json

$establishment = Invoke-RestMethod -Uri "$BASE_URL/api/establishments" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $establishmentBody

$ESTABLISHMENT_ID = $establishment.id

if (-not $ESTABLISHMENT_ID) {
    Write-Host "${RED}Failed to create establishment${NC}"
    Write-Host $establishment
    exit 1
}

Write-Host "${GREEN}Establishment created: $ESTABLISHMENT_ID${NC}`n"

# Test 2: List Establishments
Write-Host "${YELLOW}2. Listing Establishments...${NC}"
$establishments = Invoke-RestMethod -Uri "$BASE_URL/api/establishments" -Method GET
$count = $establishments.Count
Write-Host "${GREEN}Found $count establishment(s)${NC}`n"

# Test 3: Create Customer
Write-Host "${YELLOW}3. Creating Customer...${NC}"
$customerBody = @{
    establishmentId = $ESTABLISHMENT_ID
    name = "Joao Teste"
    cpf = "12345678900"
    email = "joao@test.com"
    phone = "11999999999"
} | ConvertTo-Json

$customer = Invoke-RestMethod -Uri "$BASE_URL/api/customers" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $customerBody

$CUSTOMER_ID = $customer.id

if (-not $CUSTOMER_ID) {
    Write-Host "${RED}Failed to create customer${NC}"
    Write-Host $customer
    exit 1
}

Write-Host "${GREEN}Customer created: $CUSTOMER_ID${NC}`n"

# Test 4: Create Inventory Item
Write-Host "${YELLOW}4. Creating Inventory Item...${NC}"
$itemBody = @{
    establishmentId = $ESTABLISHMENT_ID
    barcode = "7891234567890"
    name = "Produto Teste"
    category = "Eletronicos"
    brand = "Brand X"
    costPrice = 50.00
    salePrice = 99.90
    quantity = 100
    minQuantity = 10
    unit = "UN"
    description = "Produto de teste"
} | ConvertTo-Json

$item = Invoke-RestMethod -Uri "$BASE_URL/inventory" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $itemBody

$ITEM_ID = $item.id

if (-not $ITEM_ID) {
    Write-Host "${RED}Failed to create inventory item${NC}"
    Write-Host $item
    exit 1
}

Write-Host "${GREEN}Inventory item created: $ITEM_ID${NC}`n"

# Test 5: Create Sale
Write-Host "${YELLOW}5. Creating Sale...${NC}"
$saleBody = @{
    establishmentId = $ESTABLISHMENT_ID
    customerId = $CUSTOMER_ID
    saleNumber = "SALE-001"
    subtotal = 299.70
    discount = 0
    total = 299.70
    status = "COMPLETED"
    paymentMethod = "CARD"
    sellerId = "seller-123"
    notes = "Venda de teste"
} | ConvertTo-Json

$sale = Invoke-RestMethod -Uri "$BASE_URL/sales" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $saleBody

$SALE_ID = $sale.id

if (-not $SALE_ID) {
    Write-Host "${RED}Failed to create sale${NC}"
    Write-Host $sale
    exit 1
}

Write-Host "${GREEN}Sale created: $SALE_ID${NC}`n"

# Test 6: Create Expense
Write-Host "${YELLOW}6. Creating Expense...${NC}"
$expenseBody = @{
    establishmentId = $ESTABLISHMENT_ID
    category = "UTILITIES"
    description = "Conta de luz"
    amount = 500.00
    paymentMethod = "CARD"
    status = "PENDING"
    expenseDate = "2026-03-12"
    dueDate = "2026-03-20"
} | ConvertTo-Json

$expense = Invoke-RestMethod -Uri "$BASE_URL/expenses" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $expenseBody

$EXPENSE_ID = $expense.id

if (-not $EXPENSE_ID) {
    Write-Host "${RED}Failed to create expense${NC}"
    Write-Host $expense
    exit 1
}

Write-Host "${GREEN}Expense created: $EXPENSE_ID${NC}`n"

# Test 7: Create Supplier
Write-Host "${YELLOW}7. Creating Supplier...${NC}"
$supplierBody = @{
    establishmentId = $ESTABLISHMENT_ID
    name = "Fornecedor Teste"
    cnpj = "98765432000100"
    email = "fornecedor@test.com"
    phone = "1133334444"
    address = "Rua B, 456"
    city = "Sao Paulo"
    state = "SP"
    zipCode = "01310-100"
} | ConvertTo-Json

$supplier = Invoke-RestMethod -Uri "$BASE_URL/suppliers" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $supplierBody

$SUPPLIER_ID = $supplier.id

if (-not $SUPPLIER_ID) {
    Write-Host "${RED}Failed to create supplier${NC}"
    Write-Host $supplier
    exit 1
}

Write-Host "${GREEN}Supplier created: $SUPPLIER_ID${NC}`n"

# Test 8: Create Offer
Write-Host "${YELLOW}8. Creating Offer...${NC}"
$offerBody = @{
    establishmentId = $ESTABLISHMENT_ID
    inventoryItemId = $ITEM_ID
    name = "Promocao Teste"
    description = "Desconto de 20%"
    discountType = "PERCENTAGE"
    discountValue = 20
    startDate = "2026-03-12T00:00:00Z"
    endDate = "2026-03-31T23:59:59Z"
    isActive = $true
} | ConvertTo-Json

$offer = Invoke-RestMethod -Uri "$BASE_URL/offers" `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $offerBody

$OFFER_ID = $offer.id

if (-not $OFFER_ID) {
    Write-Host "${RED}Failed to create offer${NC}"
    Write-Host $offer
    exit 1
}

Write-Host "${GREEN}Offer created: $OFFER_ID${NC}`n"

# Summary
Write-Host "${BLUE}Test Summary${NC}"
Write-Host "${GREEN}All tests passed!${NC}`n"

Write-Host "Created IDs:"
Write-Host "  Establishment: $ESTABLISHMENT_ID"
Write-Host "  Customer: $CUSTOMER_ID"
Write-Host "  Inventory Item: $ITEM_ID"
Write-Host "  Sale: $SALE_ID"
Write-Host "  Expense: $EXPENSE_ID"
Write-Host "  Supplier: $SUPPLIER_ID"
Write-Host "  Offer: $OFFER_ID"

Write-Host "`n${BLUE}Business Service is working correctly!${NC}"
