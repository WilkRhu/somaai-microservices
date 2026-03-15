#!/bin/bash

# Script para iniciar o serviço de notificações localmente (sem Docker)

cd services/notifications

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🚀 Iniciando serviço de notificações..."
npm run start:dev
