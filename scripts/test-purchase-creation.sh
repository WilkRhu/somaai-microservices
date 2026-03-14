#!/bin/bash

# Script para testar criação de compra via Orquestrador

USER_ID="e4bcb9a3-f93a-429e-87c7-88c2fcb4afcc"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlNGJjYjlhMy1mOTNhLTQyOWUtODdjNy04OGMyZmNiNGFmY2MiLCJlbWFpbCI6IndpbGsuY2FldGFub0BnbWFpbC5jb20iLCJpYXQiOjE3NzM0NTYwMzUsImV4cCI6MTc3MzQ1NjAzOH0.1Iq4YL8L1EPkV7gE7iERWwRAKZ6f9tTNog_GGM6oOIo"

echo "=========================================="
echo "Teste de Criação de Compra"
echo "=========================================="
echo ""

# Teste 1: Criar compra via Orquestrador
echo "1. Criando compra via Orquestrador..."
echo "URL: http://localhost:3009/api/monolith/purchases"
echo ""

curl -X POST http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "market",
    "amount": 2.5,
    "merchant": "Teste",
    "paymentMethod": "cash",
    "purchasedAt": "2026-03-14T02:40:00.000Z",
    "items": [
      {
        "name": "Arroz",
        "quantity": 1,
        "unit": "un",
        "unitPrice": 2.5
      }
    ],
    "products": [
      {
        "name": "Arroz",
        "quantity": 1,
        "unit": "un",
        "unitPrice": 2.5
      }
    ]
  }' -v

echo ""
echo ""
echo "2. Listando compras do usuário..."
echo "URL: http://localhost:3009/api/monolith/users/$USER_ID/purchases"
echo ""

curl -X GET "http://localhost:3009/api/monolith/users/$USER_ID/purchases" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -v

echo ""
echo "=========================================="
echo "Teste concluído"
echo "=========================================="
