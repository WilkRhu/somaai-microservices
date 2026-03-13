#!/bin/bash

# Install dependencies for all services

echo "Installing dependencies for all services..."

services=(
    "auth"
    "business"
    "sales"
    "inventory"
    "delivery"
    "suppliers"
    "offers"
    "fiscal"
    "ocr"
    "payments"
    "monolith"
    "orchestrator"
)

for service in "${services[@]}"; do
    servicePath="services/$service"
    
    if [ -f "$servicePath/package.json" ]; then
        echo ""
        echo "📦 Installing dependencies for $service..."
        cd "$servicePath"
        npm install --legacy-peer-deps
        cd ../..
        echo "✅ $service done"
    else
        echo "⚠️  $service/package.json not found"
    fi
done

echo ""
echo "✅ All dependencies installed!"
