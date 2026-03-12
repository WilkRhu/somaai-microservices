#!/bin/bash

echo "🏥 Verificando saúde dos serviços..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Array de serviços
services=(
    "http://localhost:3000/health:Monolith"
    "http://localhost:3001/health:Sales"
    "http://localhost:3002/health:Inventory"
    "http://localhost:3003/health:Delivery"
    "http://localhost:3004/health:Suppliers"
    "http://localhost:3005/health:Offers"
    "http://localhost:8080:Kafka UI"
)

echo ""
for service in "${services[@]}"; do
    IFS=':' read -r url name <<< "$service"
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $name"
    else
        echo -e "${RED}❌${NC} $name"
    fi
done

echo ""
echo "📊 Dashboards:"
echo "  - Kafka UI: http://localhost:8080"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3100"
