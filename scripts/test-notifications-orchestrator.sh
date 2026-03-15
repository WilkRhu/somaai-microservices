#!/bin/bash

# Script para testar notificações passando pelo orquestrador
# Testa envio de notificações via Kafka através do orquestrador

set -e

ORCHESTRATOR_URL="http://localhost:3000"
NOTIFICATIONS_URL="http://localhost:3005"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Teste de Notificações via Orquestrador${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Função para fazer requisições
make_request() {
  local method=$1
  local url=$2
  local data=$3
  local description=$4

  echo -e "${YELLOW}→ $description${NC}"
  echo -e "  ${BLUE}$method $url${NC}"
  
  if [ -z "$data" ]; then
    response=$(curl -s -X "$method" "$url" \
      -H "Content-Type: application/json")
  else
    echo -e "  ${BLUE}Payload: $data${NC}"
    response=$(curl -s -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  echo -e "  ${GREEN}Response: $response${NC}\n"
  echo "$response"
}

# 1. Testar envio de notificação por email
echo -e "${BLUE}1. Testando envio de notificação por EMAIL${NC}\n"

EMAIL_PAYLOAD='{
  "userId": "user-123",
  "type": "EMAIL",
  "title": "Bem-vindo",
  "message": "Sua conta foi criada com sucesso",
  "recipient": "user@example.com",
  "metadata": {
    "source": "orchestrator-test",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }
}'

make_request "POST" "$NOTIFICATIONS_URL/notifications/send" "$EMAIL_PAYLOAD" \
  "Enviando notificação de email"

# 2. Testar envio de notificação em lote
echo -e "${BLUE}2. Testando envio de notificações em LOTE${NC}\n"

BULK_PAYLOAD='{
  "notifications": [
    {
      "userId": "user-123",
      "type": "EMAIL",
      "title": "Promoção",
      "message": "Aproveite 20% de desconto",
      "recipient": "user@example.com"
    },
    {
      "userId": "user-456",
      "type": "EMAIL",
      "title": "Promoção",
      "message": "Aproveite 20% de desconto",
      "recipient": "another@example.com"
    }
  ]
}'

make_request "POST" "$NOTIFICATIONS_URL/notifications/send-bulk" "$BULK_PAYLOAD" \
  "Enviando notificações em lote"

# 3. Testar preferências de notificação
echo -e "${BLUE}3. Testando PREFERÊNCIAS de notificação${NC}\n"

PREFS_PAYLOAD='{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "marketingEmails": true
}'

make_request "PUT" "$NOTIFICATIONS_URL/notifications/preferences/user-123" "$PREFS_PAYLOAD" \
  "Atualizando preferências de notificação"

# 4. Obter preferências
echo -e "${BLUE}4. Obtendo PREFERÊNCIAS de notificação${NC}\n"

make_request "GET" "$NOTIFICATIONS_URL/notifications/preferences/user-123" "" \
  "Recuperando preferências de notificação"

# 5. Registrar device token
echo -e "${BLUE}5. Registrando DEVICE TOKEN${NC}\n"

DEVICE_PAYLOAD='{
  "userId": "user-123",
  "deviceToken": {
    "token": "device-token-abc123xyz",
    "platform": "ios",
    "deviceName": "iPhone 14"
  }
}'

make_request "POST" "$NOTIFICATIONS_URL/notifications/device-tokens" "$DEVICE_PAYLOAD" \
  "Registrando device token para push notifications"

# 6. Testar envio de email direto
echo -e "${BLUE}6. Testando envio de EMAIL direto${NC}\n"

DIRECT_EMAIL_PAYLOAD='{
  "recipient": "test@example.com",
  "subject": "Teste de Email",
  "template": "welcome",
  "variables": {
    "userName": "João Silva",
    "activationLink": "https://example.com/activate/123"
  }
}'

make_request "POST" "$NOTIFICATIONS_URL/notifications/email/send" "$DIRECT_EMAIL_PAYLOAD" \
  "Enviando email direto"

# 7. Testar envio de emails em lote
echo -e "${BLUE}7. Testando envio de EMAILS em LOTE${NC}\n"

BULK_EMAIL_PAYLOAD='{
  "emails": [
    {
      "recipient": "user1@example.com",
      "subject": "Promoção Especial",
      "template": "promotion",
      "variables": {
        "discount": "20%",
        "expiryDate": "2026-03-31"
      }
    },
    {
      "recipient": "user2@example.com",
      "subject": "Promoção Especial",
      "template": "promotion",
      "variables": {
        "discount": "20%",
        "expiryDate": "2026-03-31"
      }
    }
  ]
}'

make_request "POST" "$NOTIFICATIONS_URL/notifications/email/send-bulk" "$BULK_EMAIL_PAYLOAD" \
  "Enviando emails em lote"

# 8. Obter notificações do usuário
echo -e "${BLUE}8. Obtendo NOTIFICAÇÕES do usuário${NC}\n"

make_request "GET" "$NOTIFICATIONS_URL/notifications/user-123?limit=10&offset=0" "" \
  "Recuperando notificações do usuário"

# 9. Marcar notificação como lida
echo -e "${BLUE}9. Marcando notificação como LIDA${NC}\n"

make_request "PUT" "$NOTIFICATIONS_URL/notifications/notification-id-123/read" "" \
  "Marcando notificação como lida"

# 10. Verificar status de email
echo -e "${BLUE}10. Verificando STATUS de email${NC}\n"

make_request "GET" "$NOTIFICATIONS_URL/notifications/email/status/email-id-123" "" \
  "Recuperando status de email"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Testes de notificações concluídos!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Verificar logs do serviço de notificações"
echo "2. Verificar se os eventos foram processados pelo Kafka"
echo "3. Validar emails enviados no serviço de email"
echo "4. Testar integração com o orquestrador"
