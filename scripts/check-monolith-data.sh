#!/bin/bash

# Script para verificar dados no monolith

echo "🔍 Verificando dados no monolith..."
echo ""

# Configuração do banco de dados
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="somaai"
DB_PASSWORD="somaai_password"
DB_NAME="somaai_monolith"

# Executar queries
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < scripts/check-monolith-users.sql

echo ""
echo "✅ Verificação concluída"
