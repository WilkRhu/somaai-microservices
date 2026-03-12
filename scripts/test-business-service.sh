#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3011"

echo -e "${BLUE}🧪 Testing Business Service${NC}\n"

# Test 1: Create Establishment
echo -e "${YELLOW}1️⃣  Creating Establishment...${NC}"
ESTABLISHMENT=$(curl -s -X POST $BASE_URL/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loja Teste",
    "cnpj": "12345678000190",
    "ownerId": "user-123",
    "address": "Rua Teste, 100",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "phone": "1133334444",
    "email": "loja@test.com"
  }')

ESTABLISHMENT_ID=$(echo $ESTABLISHMENT | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ESTABLISHMENT_ID" ]; then
  echo -e "${RED}❌ Failed to create establishment${NC}"
  echo $ESTABLISHMENT
  exit 1
fi

echo -e "${GREEN}✅ Establishment created: $ESTABLISHMENT_ID${NC}\n"

# Test 2: List Establishments
echo -e "${YELLOW}2️⃣  Listing Establishments...${NC}"
ESTABLISHMENTS=$(curl -s $BASE_URL/api/establishments)
COUNT=$(echo $ESTABLISHMENTS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Found $COUNT establishment(s)${NC}\n"

# Test 3: Create Customer
echo -e "${YELLOW}3️⃣  Creating Customer...${NC}"
CUSTOMER=$(curl -s -X POST $BASE_URL/api/customers \
  -H "Content-Type: application/json" \
  -d "{
    \"establishmentId\": \"$ESTABLISHMENT_ID\",
    \"name\": \"João Teste\",
    \"cpf\": \"12345678900\",
    \"email\": \"joao@test.com\",
    \"phone\": \"11999999999\",
    \"address\": \"Rua A, 123\",
    \"city\": \"São Paulo\",
    \"state\": \"SP\",
    \"zipCode\": \"01310-100\"
  }")

CUSTOMER_ID=$(echo $CUSTOMER | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$CUSTOMER_ID" ]; then
  echo -e "${RED}❌ Failed to create customer${NC}"
  echo $CUSTOMER
  exit 1
fi

echo -e "${GREEN}✅ Customer created: $CUSTOMER_ID${NC}\n"

# Test 4: Create Inventory Item
echo -e "${YELLOW}4️⃣  Creating Inventory Item...${NC}"
ITEM=$(curl -s -X POST $BASE_URL/inventory \
  -H "Content-Type: application/json" \
  -d "{
    \"establishmentId\": \"$ESTABLISHMENT_ID\",
    \"barcode\": \"7891234567890\",
    \"name\": \"Produto Teste\",
    \"category\": \"Eletrônicos\",
    \"brand\": \"Brand X\",
    \"costPrice\": 50.00,
    \"salePrice\": 99.90,
    \"quantity\": 100,
    \"minQuantity\": 10,
    \"unit\": \"UN\",
    \"description\": \"Produto de teste\"
  }")

ITEM_ID=$(echo $ITEM | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ITEM_ID" ]; then
  echo -e "${RED}❌ Failed to create inventory item${NC}"
  echo $ITEM
  exit 1
fi

echo -e "${GREEN}✅ Inventory item created: $ITEM_ID${NC}\n"

# Test 5: Create Sale
echo -e "${YELLOW}5️⃣  Creating Sale...${NC}"
SALE=$(curl -s -X POST $BASE_URL/api/sales \
  -H "Content-Type: application/json" \
  -d "{
    \"establishmentId\": \"$ESTABLISHMENT_ID\",
    \"customerId\": \"$CUSTOMER_ID\",
    \"totalAmount\": 299.70,
    \"status\": \"COMPLETED\",
    \"paymentMethod\": \"CREDIT_CARD\",
    \"notes\": \"Venda de teste\"
  }")

SALE_ID=$(echo $SALE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$SALE_ID" ]; then
  echo -e "${RED}❌ Failed to create sale${NC}"
  echo $SALE
  exit 1
fi

echo -e "${GREEN}✅ Sale created: $SALE_ID${NC}\n"

# Test 6: Create Expense
echo -e "${YELLOW}6️⃣  Creating Expense...${NC}"
EXPENSE=$(curl -s -X POST $BASE_URL/api/expenses \
  -H "Content-Type: application/json" \
  -d "{
    \"establishmentId\": \"$ESTABLISHMENT_ID\",
    \"category\": \"UTILITIES\",
    \"description\": \"Conta de luz\",
    \"amount\": 500.00,
    \"paymentMethod\": \"BANK_TRANSFER\",
    \"status\": \"PENDING\",
    \"expenseDate\": \"2026-03-12\",
    \"dueDate\": \"2026-03-20\"
  }")

EXPENSE_ID=$(echo $EXPENSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$EXPENSE_ID" ]; then
  echo -e "${RED}❌ Failed to create expense${NC}"
  echo $EXPENSE
  exit 1
fi

echo -e "${GREEN}✅ Expense created: $EXPENSE_ID${NC}\n"

# Test 7: Create Supplier
echo -e "${YELLOW}7️⃣  Creating Supplier...${NC}"
SUPPLIER=$(curl -s -X POST $BASE_URL/api/suppliers \
  -H "Content-Type: application/json" \
  -d "{
    \"establishmentId\": \"$ESTABLISHMENT_ID\",
    \"name\": \"Fornecedor Teste\",
    \"cnpj\": \"98765432000100\",
    \"email\": \"fornecedor@test.com\",
    \"phone\": \"1133334444\",
    \"address\": \"Rua B, 456\",
    \"city\": \"São Paulo\",
    \"state\": \"SP\",
    \"zipCode\": \"01310-100\"
  }")

SUPPLIER_ID=$(echo $SUPPLIER | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$SUPPLIER_ID" ]; then
  echo -e "${RED}❌ Failed to create supplier${NC}"
  echo $SUPPLIER
  exit 1
fi

echo -e "${GREEN}✅ Supplier created: $SUPPLIER_ID${NC}\n"

# Test 8: Create Offer
echo -e "${YELLOW}8️⃣  Creating Offer...${NC}"
OFFER=$(curl -s -X POST $BASE_URL/api/offers \
  -H "Content-Type: application/json" \
  -d "{
    \"establishmentId\": \"$ESTABLISHMENT_ID\",
    \"inventoryItemId\": \"$ITEM_ID\",
    \"name\": \"Promoção Teste\",
    \"description\": \"Desconto de 20%\",
    \"discountType\": \"PERCENTAGE\",
    \"discountValue\": 20,
    \"startDate\": \"2026-03-12T00:00:00Z\",
    \"endDate\": \"2026-03-31T23:59:59Z\",
    \"isActive\": true
  }")

OFFER_ID=$(echo $OFFER | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$OFFER_ID" ]; then
  echo -e "${RED}❌ Failed to create offer${NC}"
  echo $OFFER
  exit 1
fi

echo -e "${GREEN}✅ Offer created: $OFFER_ID${NC}\n"

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}\n"

echo "Created IDs:"
echo "  Establishment: $ESTABLISHMENT_ID"
echo "  Customer: $CUSTOMER_ID"
echo "  Inventory Item: $ITEM_ID"
echo "  Sale: $SALE_ID"
echo "  Expense: $EXPENSE_ID"
echo "  Supplier: $SUPPLIER_ID"
echo "  Offer: $OFFER_ID"

echo -e "\n${BLUE}🎉 Business Service is working correctly!${NC}"
