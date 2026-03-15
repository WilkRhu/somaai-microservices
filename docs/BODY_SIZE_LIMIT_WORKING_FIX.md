# Body Size Limit Fix - Working Solution ✅ RESOLVIDO

## Problema
Erro ao iniciar orquestrador:
```
Error: Cannot find module 'express'
```

## Causa
Express não estava sendo importado corretamente. Precisa usar `require()` dentro da função bootstrap, não como import no topo.

## Solução
1. Desabilitar o body parser padrão do NestJS: `bodyParser: false`
2. Usar `require('express')` dentro da função bootstrap
3. Aplicar middleware com limite de 50MB

## Mudanças Realizadas

### 1. Business Service - `services/business/src/main.ts`
✅ Desabilitar body parser padrão e aplicar middleware customizado

```typescript
const app = await NestFactory.create(AppModule, {
  bodyParser: false,
});

// Increase body size limit for base64 images
const express = require('express');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### 2. Orchestrator Service - `services/orchestrator/src/main.ts`
✅ Mesma abordagem

```typescript
const app = await NestFactory.create(AppModule, {
  bodyParser: false,
});

// Increase body size limit for base64 images
const express = require('express');
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

## Como Testar

### 1. Reconstruir os serviços
```bash
# Business Service
cd services/business
npm run build

# Orchestrator
cd services/orchestrator
npm run build
```

### 2. Iniciar os serviços
```bash
# Terminal 1 - Business Service
cd services/business
npm run start:dev

# Terminal 2 - Orchestrator
cd services/orchestrator
npm run start:dev
```

### 3. Enviar request com logo
```bash
curl -X POST http://localhost:3009/api/business/establishments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Padoca do Wilk",
    "cnpj": "47.433.478/0001-79",
    "type": "Padaria",
    "phone": "(81) 99394-9202",
    "email": "wilkrhu@hotmail.com",
    "address": "Rua Maria Emília Boeckmann, 1017",
    "city": "Paulista",
    "state": "PE",
    "zipCode": "53441-595",
    "description": "Padaria artesanal",
    "latitude": -7.940787842769113,
    "longitude": -34.8647693976013,
    "logo": "data:image/png;base64,iVBORw0KGgoAAAAAAAA..."
  }'
```

## Verificação

✅ Serviços iniciam sem erros
✅ Limite de body aumentado para 50MB
✅ Suporta base64 de imagens grandes
✅ Sem erros de módulo não encontrado
✅ Pronto para produção

## Fluxo Funcionando

```
Cliente
  ↓
POST /api/business/establishments (50MB limit)
  ├─ Orquestrador recebe (50MB limit) ✅
  └─ Repassa para Business Service (50MB limit) ✅
  ↓
Business Service
  ├─ Processa base64
  ├─ Envia para Upload Service
  └─ Retorna URL do logo
  ↓
Resposta HTTP 201 ✅
```

## Resumo

O erro foi resolvido:
1. Desabilitando o body parser padrão do NestJS
2. Aplicando middleware express customizado com limite de 50MB
3. Usando `require()` dentro da função bootstrap

Agora ambos os serviços conseguem processar requests com logos em base64 sem problemas.
