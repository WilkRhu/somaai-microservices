#!/bin/bash

# Script para iniciar todos os microserviços localmente em paralelo
# Uso: ./scripts/start-all-services.sh

echo "🚀 Iniciando todos os microserviços SomaAI (LOCAL)..."
echo ""

# Lista de serviços
services=(
    "auth"
    "monolith"
    "sales"
    "inventory"
    "delivery"
    "suppliers"
    "offers"
    "fiscal"
    "ocr"
    "payments"
)

# Array para armazenar os PIDs
pids=()

# Instalar dependências e iniciar cada serviço em background
for service in "${services[@]}"; do
    service_path="services/$service"
    
    if [ -d "$service_path" ]; then
        echo "📦 Preparando $service..."
        
        # Instalar deps e iniciar em background
        (cd "$service_path" && npm install --legacy-peer-deps 2>&1 > /dev/null && npm run start:dev) &
        pids+=($!)
        
        sleep 0.3
    else
        echo "⚠️  Serviço $service não encontrado em $service_path"
    fi
done

echo ""
echo "✅ Todos os serviços foram iniciados em background!"
echo ""
echo "Processos em execução:"
for i in "${!services[@]}"; do
    echo "  • ${services[$i]} (PID: ${pids[$i]})"
done

echo ""
echo "📊 URLs dos Serviços:"
echo "  • Auth Service: http://localhost:3000"
echo "  • Monolith: http://localhost:3000"
echo "  • Sales: http://localhost:3001"
echo "  • Inventory: http://localhost:3002"
echo "  • Delivery: http://localhost:3003"
echo "  • Suppliers: http://localhost:3004"
echo "  • Offers: http://localhost:3005"
echo "  • Fiscal: http://localhost:3006"
echo "  • OCR: http://localhost:3007"
echo "  • Payments: http://localhost:3008"

echo ""
echo "💡 Para ver logs de um serviço: tail -f services/SERVICE_NAME/logs.txt"
echo "💡 Para parar todos: ./scripts/stop-all-services.sh"
echo ""
