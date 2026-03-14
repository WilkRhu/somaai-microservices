#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testando Proxy do Monolith ===${NC}\n"

# 1. Login
echo -e "${YELLOW}1. Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extrai o token e user ID
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Erro: Não conseguiu fazer login${NC}"
  exit 1
fi

echo -e "${GREEN}Token obtido: ${TOKEN:0:50}...${NC}"
echo -e "${GREEN}User ID: $USER_ID${NC}\n"

# 2. Listar compras do usuário
echo -e "${YELLOW}2. Listando compras do usuário...${NC}"
LIST_RESPONSE=$(curl -s -X GET http://localhost:3009/api/monolith/users/$USER_ID/purchases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $LIST_RESPONSE"
echo ""

# 3. Criar compra
echo -e "${YELLOW}3. Criando nova compra...${NC}"
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3009/api/monolith/users/$USER_ID/purchases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total": 150.00,
    "status": "pending",
    "items": [
      {
        "productId": "prod-1",
        "quantity": 2,
        "price": 75.00
      }
    ]
  }')

echo "Response: $CREATE_RESPONSE"

# Extrai o purchase ID
PURCHASE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$PURCHASE_ID" ]; then
  echo -e "${RED}Erro: Não conseguiu criar compra${NC}"
else
  echo -e "${GREEN}Purchase ID: $PURCHASE_ID${NC}\n"
  
  # 4. Obter compra específica
  echo -e "${YELLOW}4. Obtendo compra específica...${NC}"
  GET_RESPONSE=$(curl -s -X GET http://localhost:3009/api/monolith/users/$USER_ID/purchases/$PURCHASE_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  echo "Response: $GET_RESPONSE"
  echo ""
  
  # 5. Atualizar compra
  echo -e "${YELLOW}5. Atualizando compra...${NC}"
  UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3009/api/monolith/users/$USER_ID/purchases/$PURCHASE_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "shipped"
    }')
  
  echo "Response: $UPDATE_RESPONSE"
  echo ""
fi

# 6. Listar todas as compras
echo -e "${YELLOW}6. Listando todas as compras...${NC}"
ALL_RESPONSE=$(curl -s -X GET http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $ALL_RESPONSE"
echo ""

echo -e "${GREEN}=== Teste Completo ===${NC}"
