#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AUTH_URL="http://localhost:3010"
ORCHESTRATOR_URL="http://localhost:3009"
MONOLITH_URL="http://localhost:3000"

# Test credentials
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Test@123456"

echo -e "${YELLOW}=== Purchase Creation Test ===${NC}\n"

# Step 1: Register user
echo -e "${YELLOW}Step 1: Registering user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Response: $REGISTER_RESPONSE"

# Extract token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}Failed to get access token${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Got access token: ${ACCESS_TOKEN:0:20}...${NC}\n"

# Extract user ID
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
echo -e "${GREEN}✓ User ID: $USER_ID${NC}\n"

# Step 2: Create purchase via orchestrator
echo -e "${YELLOW}Step 2: Creating purchase via orchestrator...${NC}"

PURCHASE_PAYLOAD='{
  "type": "market",
  "merchant": "Supermercado Extra",
  "amount": 150.50,
  "paymentMethod": "pix",
  "purchasedAt": "2026-03-14T17:00:00.000Z",
  "description": "Compras da semana",
  "items": [
    {
      "name": "Arroz",
      "quantity": 2,
      "unit": "kg",
      "unitPrice": 8.50
    },
    {
      "name": "Feijão",
      "quantity": 1,
      "unit": "kg",
      "unitPrice": 12.00
    }
  ]
}'

echo "Payload:"
echo "$PURCHASE_PAYLOAD" | jq '.'

PURCHASE_RESPONSE=$(curl -s -X POST "$ORCHESTRATOR_URL/api/monolith/users/$USER_ID/purchases" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "$PURCHASE_PAYLOAD")

echo -e "\nResponse:"
echo "$PURCHASE_RESPONSE" | jq '.'

# Check if successful
if echo "$PURCHASE_RESPONSE" | grep -q '"id"'; then
  echo -e "${GREEN}✓ Purchase created successfully${NC}"
  PURCHASE_ID=$(echo $PURCHASE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
  echo -e "${GREEN}✓ Purchase ID: $PURCHASE_ID${NC}\n"
else
  echo -e "${RED}✗ Failed to create purchase${NC}\n"
  exit 1
fi

# Step 3: Get purchase
echo -e "${YELLOW}Step 3: Getting purchase...${NC}"
GET_RESPONSE=$(curl -s -X GET "$ORCHESTRATOR_URL/api/monolith/users/$USER_ID/purchases/$PURCHASE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response:"
echo "$GET_RESPONSE" | jq '.'

echo -e "\n${GREEN}=== Test completed successfully ===${NC}"
