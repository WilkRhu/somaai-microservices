#!/bin/bash

# Script para enviar um email de teste
# Uso: ./scripts/send-email-test.sh

NOTIFICATIONS_URL="http://localhost:3005"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "\n${CYAN}📧 Enviando email de teste...${NC}\n"

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

EMAIL_PAYLOAD='{
  "recipient": "wilk.caetano@gmail.com",
  "subject": "Teste de Email - Sistema de Notificações",
  "template": "welcome",
  "variables": {
    "userName": "Wilk Caetano",
    "activationLink": "https://example.com/activate/test-123",
    "timestamp": "'$TIMESTAMP'"
  }
}'

echo -e "${YELLOW}📤 Enviando para: wilk.caetano@gmail.com${NC}"
echo -e "${YELLOW}📝 Assunto: Teste de Email - Sistema de Notificações${NC}"
echo -e "${YELLOW}🎨 Template: welcome${NC}"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$NOTIFICATIONS_URL/notifications/email/send" \
  -H "Content-Type: application/json" \
  -d "$EMAIL_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo -e "${GREEN}✅ Email enviado com sucesso!${NC}"
  echo -e "${GREEN}📊 Status: $HTTP_CODE${NC}"
  echo -e "${GREEN}📋 Resposta:${NC}"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ Erro ao enviar email${NC}"
  echo -e "${RED}📊 Status: $HTTP_CODE${NC}"
  echo -e "${RED}📋 Resposta:${NC}"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  exit 1
fi

echo ""
