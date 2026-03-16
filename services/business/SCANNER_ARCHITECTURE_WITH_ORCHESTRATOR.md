# Scanner Integration - Arquitetura com Orquestrador

## 🏗️ Arquitetura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCANNER INTEGRATION                          │
│                   (Com Orquestrador)                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐      ┌──────────────┐
│  App Mobile  │         │  Frontend        │      │  Orquestrador│
│  (Socket.IO) │◄───────►│  Dashboard       │◄────►│  (Gateway)   │
└──────────────┘         └──────────────────┘      └──────┬───────┘
       │                         │                        │
       │ emit('scan')            │                        │
       └────────────────────────►│                        │
                                 │ broadcast              │
                                 └───────────────────────►│
                                                          │
                                                    ┌─────▼──────────┐
                                                    │ ScannerGateway │
                                                    │ (Orquestrador) │
                                                    └─────┬──────────┘
                                                          │
                                                    HTTP POST
                                                    /scanner/process
                                                          │
                                                    ┌─────▼──────────┐
                                                    │ ScannerController
                                                    │ (Business)     │
                                                    └─────┬──────────┘
                                                          │
                                                    ┌─────▼──────────┐
                                                    │ ScannerService │
                                                    │ - Valida       │
                                                    │ - Cache        │
                                                    │ - BD           │
                                                    └─────┬──────────┘
                                                          │
                                                    ┌─────▼──────────┐
                                                    │ InventoryItem  │
                                                    │ (Database)     │
                                                    └────────────────┘
```

## 📊 Fluxo de Dados Detalhado

### 1. Conexão WebSocket (App Mobile → Orquestrador)

```javascript
// App Mobile
const socket = io('http://seu-servidor:3001/scanner', {
  query: {
    deviceId: 'mobile-1',
    type: 'mobile'
  }
});
```

**Porta**: 3001 (Orquestrador)

### 2. Envio de Scan (App Mobile → Orquestrador)

```javascript
socket.emit('scan', {
  barcode: '7896259410133',
  timestamp: '2026-03-15T10:30:00.000Z'
})
```

### 3. Processamento no Orquestrador

```
ScannerGateway (Orquestrador)
  ↓
Valida payload
  ↓
Faz HTTP POST para Business Service
  POST http://business:3002/scanner/process
  ↓
Aguarda resposta
```

### 4. Processamento no Business

```
ScannerController (Business)
  ↓
ScannerService.processScan()
  ├─ Valida barcode
  ├─ Busca em cache (5 min TTL)
  ├─ Se não encontrado, busca no BD
  ├─ Mapeia resultado
  └─ Retorna ScanResultDto
```

### 5. Resposta (Business → Orquestrador)

```json
{
  "success": true,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T10:30:00.000Z",
  "product": {
    "normalizedName": "Produto",
    "originalName": "Produto Original",
    "brand": "Marca",
    "category": "Categoria",
    "unit": "UN",
    "averagePrice": "25.50",
    "purchaseCount": 5
  }
}
```

### 6. Broadcast (Orquestrador → App/Dashboard)

```javascript
// Envia para o app que enviou
client.emit('scan-result', result);

// Broadcast para todos (dashboard)
server.emit('scan-result', {
  ...result,
  fromDevice: 'mobile-1'
});
```

## 🔄 Componentes

### Orquestrador (`services/orchestrator/src/business/`)

**scanner.gateway.ts**
- Recebe conexões WebSocket
- Faz proxy HTTP para Business Service
- Broadcast de resultados

**scanner.module.ts**
- Módulo NestJS
- Importa HttpModule para fazer requisições

### Business (`services/business/src/scanner/`)

**scanner.gateway.ts**
- Recebe conexões WebSocket diretas (opcional)
- Pode ser usado para comunicação direta

**scanner.controller.ts**
- Endpoint HTTP: `POST /scanner/process`
- Recebe requisições do Orquestrador

**scanner.service.ts**
- Lógica de processamento
- Cache em memória
- Busca no banco de dados

**scanner.module.ts**
- Módulo NestJS
- Exporta ScannerService

## 🌐 Portas

| Serviço | Porta | Namespace | Descrição |
|---------|-------|-----------|-----------|
| Orquestrador | 3001 | `/scanner` | Gateway WebSocket (entrada) |
| Business | 3002 | `/scanner` | Gateway WebSocket (opcional) |
| Business | 3002 | `/scanner/process` | Endpoint HTTP (proxy) |

## 🔐 Fluxo de Autenticação

```
App Mobile
  ↓
Orquestrador (sem autenticação no WebSocket)
  ↓
Business Service (pode adicionar autenticação)
  ↓
Banco de Dados
```

**Nota**: Adicionar autenticação JWT no Business Service se necessário.

## 📝 Variáveis de Ambiente

### Orquestrador (`.env`)

```env
PORT=3001
BUSINESS_SERVICE_URL=http://business:3002
```

### Business (`.env`)

```env
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=somaai_business
```

## 🚀 Como Usar

### 1. Iniciar Serviços

```bash
# Terminal 1 - Business Service
cd services/business
npm run start:dev

# Terminal 2 - Orquestrador
cd services/orchestrator
npm run start:dev
```

### 2. App Mobile

```javascript
import { io } from 'socket.io-client';

const socket = io('http://seu-servidor:3001/scanner', {
  query: {
    deviceId: 'mobile-1',
    type: 'mobile'
  }
});

socket.on('connect', () => {
  console.log('Conectado ao orquestrador!');
});

socket.emit('scan', {
  barcode: '7896259410133',
  timestamp: new Date().toISOString()
});

socket.on('scan-result', (data) => {
  if (data.product) {
    console.log('Produto:', data.product.originalName);
  }
});
```

### 3. Frontend Dashboard

```javascript
import { io } from 'socket.io-client';

const socket = io('http://seu-servidor:3001/scanner', {
  query: {
    deviceId: 'dashboard-1',
    type: 'dashboard'
  }
});

socket.on('scan-result', (data) => {
  console.log('Novo scan:', data);
  // Atualizar UI
});
```

## 🧪 Teste

### Com cURL (HTTP)

```bash
curl -X POST http://localhost:3002/scanner/process \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }'
```

### Com WebSocket (Orquestrador)

```bash
websocat "ws://localhost:3009/api/business/scanner?deviceId=test&type=mobile"

# Enviar:
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T10:30:00.000Z"}}
```

## 🔄 Tratamento de Erros

### Se Business Service não responder

```javascript
// Orquestrador retorna erro
{
  "success": false,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T10:30:00.000Z",
  "product": null,
  "error": "Serviço indisponível"
}
```

### Se Barcode for inválido

```javascript
{
  "success": false,
  "barcode": "",
  "timestamp": "2026-03-15T10:30:00.000Z",
  "product": null,
  "error": "Barcode inválido"
}
```

## 📊 Eventos WebSocket

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `scan` | App → Orquestrador | Envia código de barras |
| `scan-result` | Orquestrador → App/Frontend | Retorna produto |
| `client-connected` | Orquestrador → Todos | Nova conexão |
| `client-disconnected` | Orquestrador → Todos | Desconexão |

## 🎯 Vantagens da Arquitetura com Orquestrador

✅ **Ponto de entrada único** - Todas as requisições passam pelo orquestrador
✅ **Escalabilidade** - Fácil adicionar mais serviços
✅ **Segurança** - Autenticação centralizada
✅ **Monitoramento** - Logs centralizados
✅ **Load Balancing** - Distribuir requisições
✅ **Rate Limiting** - Controlar fluxo de requisições

## 🔧 Próximos Passos

1. Adicionar autenticação JWT
2. Implementar rate limiting
3. Adicionar métricas Prometheus
4. Implementar circuit breaker
5. Adicionar retry logic com backoff
6. Persistir histórico de scans
7. Implementar validação de duplicatas

## 📚 Arquivos Relacionados

- `SCANNER_SETUP.md` - Guia de configuração
- `SCANNER_TEST_EXAMPLE.md` - Exemplos de teste
- `SCANNER_IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
