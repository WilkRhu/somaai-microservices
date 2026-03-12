#!/bin/bash

echo "🚀 Iniciando SomaAI Microservices..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se docker-compose existe
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não encontrado"
    exit 1
fi

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando .env..."
    cp .env.example .env
fi

# Build e start
echo -e "${YELLOW}📦 Building images...${NC}"
docker-compose build

echo -e "${YELLOW}🐳 Starting containers...${NC}"
docker-compose up -d

# Aguardar serviços ficarem prontos
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 10

# Verificar saúde
echo -e "${YELLOW}🏥 Verificando saúde dos serviços...${NC}"
./scripts/health-check.sh

echo -e "${GREEN}✅ SomaAI Microservices iniciado com sucesso!${NC}"
echo ""
echo "📊 Dashboards disponíveis:"
echo "  - Nginx: http://localhost"
echo "  - Kafka UI: http://localhost:8080"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3100"
echo ""
echo "📝 Ver logs: docker-compose logs -f"
