#!/bin/bash

# Script para testar sincronização de usuários entre Auth e Monolith

set -e

echo "🧪 Iniciando testes de sincronização de usuários..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs dos serviços
AUTH_URL="http://localhost:3010"
MONOLITH_URL="http://localhost:3000"

# Função para testar
test_sync() {
  local test_name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5
  
  echo -e "${YELLOW}📝 Teste: $test_name${NC}"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$endpoint" \
      -H "Content-Type: application/json" \
      -H "X-Internal-Service: auth-service" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X GET "$endpoint" \
      -H "X-Internal-Service: auth-service")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ Status: $http_code (esperado: $expected_status)${NC}"
    echo "Response: $body"
  else
    echo -e "${RED}❌ Status: $http_code (esperado: $expected_status)${NC}"
    echo "Response: $body"
  fi
  
  echo ""
}

# Teste 1: Registrar novo usuário no Auth
echo -e "${YELLOW}=== TESTE 1: Registrar Usuário no Auth ===${NC}"
echo ""

REGISTER_DATA='{
  "email": "testuser'$(date +%s)'@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User",
  "phone": "11999999999"
}'

REGISTER_RESPONSE=$(curl -s -X POST "$AUTH_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA")

USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
USER_EMAIL=$(echo "$REGISTER_DATA" | grep -o '"email":"[^"]*' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo -e "${RED}❌ Falha ao registrar usuário${NC}"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Usuário registrado com sucesso${NC}"
echo "User ID: $USER_ID"
echo "Email: $USER_EMAIL"
echo ""

# Teste 2: Aguardar sincronização
echo -e "${YELLOW}=== TESTE 2: Aguardar Sincronização ===${NC}"
echo ""
echo "⏳ Aguardando 2 segundos para sincronização..."
sleep 2
echo ""

# Teste 3: Verificar se usuário existe no Monolith
echo -e "${YELLOW}=== TESTE 3: Verificar Usuário no Monolith ===${NC}"
echo ""

CHECK_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$MONOLITH_URL/api/users/internal/check/$USER_ID" \
  -H "X-Internal-Service: auth-service")

http_code=$(echo "$CHECK_RESPONSE" | tail -n1)
body=$(echo "$CHECK_RESPONSE" | head -n-1)

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Usuário encontrado no Monolith${NC}"
  echo "Response: $body"
else
  echo -e "${RED}❌ Usuário NÃO encontrado no Monolith${NC}"
  echo "Status: $http_code"
  echo "Response: $body"
fi

echo ""
echo -e "${YELLOW}=== TESTE 4: Sincronização Manual (HTTP) ===${NC}"
echo ""

SYNC_DATA='{
  "id": "'$USER_ID'",
  "email": "'$USER_EMAIL'",
  "firstName": "Test",
  "lastName": "User",
  "phone": "11999999999",
  "avatar": null,
  "authProvider": "EMAIL",
  "role": "USER",
  "emailVerified": false
}'

SYNC_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$MONOLITH_URL/api/users/internal/sync-from-auth" \
  -H "Content-Type: application/json" \
  -H "X-Internal-Service: auth-service" \
  -d "$SYNC_DATA")

http_code=$(echo "$SYNC_RESPONSE" | tail -n1)
body=$(echo "$SYNC_RESPONSE" | head -n-1)

if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Sincronização manual bem-sucedida${NC}"
  echo "Status: $http_code"
  echo "Response: $body"
else
  echo -e "${RED}❌ Falha na sincronização manual${NC}"
  echo "Status: $http_code"
  echo "Response: $body"
fi

echo ""
echo -e "${GREEN}🎉 Testes concluídos!${NC}"
