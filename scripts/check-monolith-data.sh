#!/bin/bash

# Script para verificar dados no monolith

echo "🔍 Verificando dados no monolith..."
echo ""

# Configuração do banco de dados (lê de variáveis de ambiente)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USERNAME:-somaai}"
DB_PASSWORD="${DB_PASSWORD:?Erro: variável DB_PASSWORD não definida}"
DB_NAME="somaai_monolith"

# Executar queries
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < scripts/check-monolith-users.sql

echo ""
echo "✅ Verificação concluída"
