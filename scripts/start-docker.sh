#!/bin/bash

# Script para iniciar todos os serviços com Docker Compose
# Uso: ./scripts/start-docker.sh

echo "🐳 Iniciando todos os serviços com Docker Compose..."
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale Docker Compose primeiro."
    exit 1
fi

# Iniciar os serviços
echo "📦 Iniciando containers..."
docker-compose up -d

echo ""
echo "✅ Todos os serviços foram iniciados com Docker!"
echo ""
echo "📊 URLs dos Serviços:"
echo "  • API Gateway: http://localhost"
echo "  • Auth Service: http://localhost:3000"
echo "  • Sales: http://localhost:3001"
echo "  • Inventory: http://localhost:3002"
echo "  • Delivery: http://localhost:3003"
echo "  • Suppliers: http://localhost:3004"
echo "  • Offers: http://localhost:3005"
echo "  • Kafka UI: http://localhost:8080"
echo "  • Prometheus: http://localhost:9090"
echo "  • Grafana: http://localhost:3100"
echo "  • Kibana: http://localhost:5601"

echo ""
echo "📋 Comandos úteis:"
echo "  • Ver logs: docker-compose logs -f"
echo "  • Ver status: docker-compose ps"
echo "  • Parar: docker-compose down"
echo "  • Rebuild: docker-compose up -d --build"

echo ""
echo "💡 Para parar todos os serviços, execute: docker-compose down"
