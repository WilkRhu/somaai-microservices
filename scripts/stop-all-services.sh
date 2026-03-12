#!/bin/bash

# Script para parar todos os microserviços
# Uso: ./scripts/stop-all-services.sh

echo "🛑 Parando todos os microserviços SomaAI..."
echo ""

# Parar todos os processos npm
echo "Procurando processos npm em execução..."

# Encontrar e parar todos os processos node
pids=$(pgrep -f "npm run start:dev")

if [ -z "$pids" ]; then
    echo "ℹ️  Nenhum processo npm encontrado em execução"
else
    echo "Encontrados processos em execução"
    
    for pid in $pids; do
        echo "  ⏹️  Parando processo PID: $pid"
        kill -9 $pid 2>/dev/null
    done
    
    echo ""
    echo "✅ Todos os processos foram parados!"
fi

echo ""
echo "💡 Para iniciar novamente, execute: ./scripts/start-all-services.sh"
