#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Testando Fluxo de Autenticação ===${NC}\n"

# 1. Login
echo -e "${YELLOW}1. Fazendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extrai o token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Erro: Não conseguiu fazer login${NC}"
  exit 1
fi

echo -e "${GREEN}Token obtido: ${TOKEN:0:50}...${NC}\n"

# 2. Verificar token no auth service
echo -e "${YELLOW}2. Verificando token no auth service...${NC}"
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3010/api/auth/verify-token \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $VERIFY_RESPONSE"
echo ""

# 3. Tentar acessar o monolith
echo -e "${YELLOW}3. Tentando acessar monolith com o token...${NC}"
MONOLITH_RESPONSE=$(curl -s -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $MONOLITH_RESPONSE"
echo ""

# 4. Tentar acessar o orchestrador
echo -e "${YELLOW}4. Tentando acessar orchestrador com o token...${NC}"
ORCHESTRATOR_RESPONSE=$(curl -s -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $ORCHESTRATOR_RESPONSE"
echo ""

echo -e "${GREEN}=== Teste Completo ===${NC}"
