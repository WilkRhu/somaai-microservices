#!/bin/bash

# Script para enviar email direto usando SMTP
# Não precisa do serviço de notificações rodando

EMAIL_TO="wilk.caetano@gmail.com"
EMAIL_FROM="somaai@wilkcaetano.com.br"
SMTP_SERVER="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="somaai@wilkcaetano.com.br"
SMTP_PASSWORD="${SMTP_PASSWORD}"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$SMTP_PASSWORD" ]; then
    echo -e "${RED}❌ Erro: Variável de ambiente SMTP_PASSWORD não definida${NC}"
    echo ""
    echo -e "${YELLOW}Configure a senha SMTP:${NC}"
    echo -e "${CYAN}export SMTP_PASSWORD=\"sua-senha-aqui\"${NC}"
    exit 1
fi

echo -e "\n${CYAN}📧 Enviando email direto via SMTP...${NC}\n"

TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Criar arquivo temporário com o email
EMAIL_FILE=$(mktemp)
cat > "$EMAIL_FILE" << EOF
From: $EMAIL_FROM
To: $EMAIL_TO
Subject: Teste de Email - Sistema de Notificações
Content-Type: text/plain; charset=UTF-8

Olá Wilk Caetano,

Este é um email de teste do sistema de notificações SomaAI.

Timestamp: $TIMESTAMP

Link de ativação: https://example.com/activate/test-123

---
SomaAI - Sistema de Notificações
EOF

echo -e "${YELLOW}📤 Enviando para: $EMAIL_TO${NC}"
echo -e "${YELLOW}📝 Assunto: Teste de Email - Sistema de Notificações${NC}"
echo -e "${YELLOW}📧 De: $EMAIL_FROM${NC}"
echo ""

# Usar ssmtp ou sendmail se disponível
if command -v ssmtp &> /dev/null; then
    ssmtp "$EMAIL_TO" < "$EMAIL_FILE"
    RESULT=$?
elif command -v sendmail &> /dev/null; then
    sendmail "$EMAIL_TO" < "$EMAIL_FILE"
    RESULT=$?
elif command -v mail &> /dev/null; then
    mail -s "Teste de Email - Sistema de Notificações" "$EMAIL_TO" < "$EMAIL_FILE"
    RESULT=$?
else
    echo -e "${RED}❌ Nenhum cliente SMTP encontrado${NC}"
    echo ""
    echo -e "${YELLOW}Instale um dos seguintes:${NC}"
    echo "  - ssmtp: apt-get install ssmtp"
    echo "  - sendmail: apt-get install sendmail"
    echo "  - mailutils: apt-get install mailutils"
    rm "$EMAIL_FILE"
    exit 1
fi

rm "$EMAIL_FILE"

if [ $RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Email enviado com sucesso!${NC}"
    echo ""
    echo -e "${CYAN}Verifique sua caixa de entrada em: $EMAIL_TO${NC}"
else
    echo -e "${RED}❌ Erro ao enviar email${NC}"
    exit 1
fi

echo ""
