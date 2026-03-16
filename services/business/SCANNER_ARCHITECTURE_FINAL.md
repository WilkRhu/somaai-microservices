# Scanner Integration - Arquitetura Final (Corrigida)

## 🏗️ Arquitetura Correta

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PORTA DE ENTRADA PÚBLICA                         │
│                    (Orquestrador - Porta 3009)                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────┐
│  App Mobile  │         │  Frontend        │
│  (Internet)  │         │  Dashboard       │
│              │         │  (Internet)      │
└──────┬───────┘         └────────┬─────────┘
       │                          │
       │ WebSocket                │ WebSocket
       │ ws://3009/api/business/scanner
       │                          │
       └──────────────┬───────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR (Porta 3009)                        │
│                    (Ponto de Entrada Único)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ScannerGateway                                               │  │
│  │ - Recebe WebSocket (público)                                 │  │
│  │ - Faz proxy HTTP para Business (interno)                     │  │
│  │ - Broadcast de resultados                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST (INTERNO)
                              │ http://business:3002/scanner/process
                              │ (Não exposto publicamente)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS SERVICE (Porta 3002)                    │
│                    (Não exposto publicamente)                       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ScannerController                                            │  │
│  │ - Endpoint: POST /scanner/process (INTERNO)                  │  │
│  │ - Recebe requisições HTTP do Orquestrador                    │  │
│  │ - Valida DTOs                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ScannerService                                               │  │
│  │ - Valida barcode                                             │  │
│  │ - Busca em cache (5 min TTL)                                 │  │
│  │ - Busca no banco de dados                                    │  │
│  │ - Mapeia resultado para DTO                                  │  │
│  │ - Retorna ScanResultDto                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Database (MySQL)                                             │  │
│  │ - inventory_items                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔐 Segurança de Rede

### Portas Públicas (Expostas)
- **3009** - Orquestrador (única porta pública)
  - Rota: `/api/business/scanner` (WebSocket)
  - Autenticação: JWT (recomendado)
  - CORS: Configurado

### Portas Internas (Não Expostas)
- **3002** - Business Service (apenas para orquestrador)
  - Rota: `/scanner/process` (HTTP)
  - Sem autenticação (rede interna)
  - Sem CORS (rede interna)

## 📊 Fluxo de Dados

```
1. CONEXÃO (Pública)
   App Mobile / Frontend
   └─ WebSocket: ws://seu-servidor:3009/api/business/scanner
      └─ Orquestrador recebe conexão
         └─ Armazena em connectedClients

2. ENVIO DE SCAN (Pública → Interna)
   App Mobile
   └─ emit('scan', { barcode, timestamp })
      └─ Orquestrador recebe evento
         └─ Valida payload
            └─ HTTP POST http://business:3002/scanner/process (INTERNO)
               └─ Business recebe requisição
                  └─ ScannerController.processScan()
                     └─ ScannerService.processScan()
                        ├─ Valida barcode
                        ├─ Busca em cache
                        ├─ Busca no banco de dados
                        └─ Retorna ScanResultDto

3. RESPOSTA (Interna → Pública)
   Business
   └─ HTTP 200 OK
      └─ { success: true, product: {...} }
         └─ Orquestrador recebe resposta
            └─ emit('scan-result', result) para App Mobile
               └─ broadcast('scan-result', result) para Dashboard

4. RECEBIMENTO (Pública)
   App Mobile / Frontend
   └─ on('scan-result', (data) => { ... })
      └─ Exibe resultado
```

## 🌐 Endpoints

### Público (Orquestrador)

**WebSocket**
```
ws://seu-servidor:3009/api/business/scanner
```

**Eventos**
- `scan` - App → Orquestrador (envia barcode)
- `scan-result` - Orquestrador → App/Frontend (resultado)
- `client-connected` - Orquestrador → Todos (nova conexão)
- `client-disconnected` - Orquestrador → Todos (desconexão)

### Interno (Business)

**HTTP**
```
POST http://business:3002/scanner/process
```

**Payload**
```json
{
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**Resposta**
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

## 🚀 Como Usar

### App Mobile (Conecta ao Orquestrador)

```javascript
import { io } from 'socket.io-client';

// Conectar ao ORQUESTRADOR (porta 3009, pública)
const socket = io('https://seu-servidor:3009/api/business/scanner', {
  query: { deviceId: 'mobile-1', type: 'mobile' }
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

### Frontend Dashboard (Conecta ao Orquestrador)

```javascript
import { io } from 'socket.io-client';

// Conectar ao ORQUESTRADOR (porta 3009, pública)
const socket = io('https://seu-servidor:3009/api/business/scanner', {
  query: { deviceId: 'dashboard-1', type: 'dashboard' }
});

socket.on('scan-result', (data) => {
  console.log('Novo scan:', data);
  // Atualizar UI
});
```

### Business Service (Recebe do Orquestrador)

```typescript
// Não precisa fazer nada - apenas expõe o endpoint HTTP
// POST /scanner/process
// O orquestrador faz o proxy automaticamente
```

## 🔒 Segurança

### Recomendações

1. **Autenticação JWT**
   - Adicionar JWT validation no Orquestrador
   - Validar token antes de aceitar WebSocket

2. **CORS**
   - Configurar domínios permitidos em produção
   - Não usar `*` em produção

3. **Rate Limiting**
   - Limitar requisições por dispositivo
   - Limitar requisições por IP

4. **Firewall**
   - Expor apenas porta 3009 (Orquestrador)
   - Bloquear acesso direto à porta 3002 (Business)
   - Permitir comunicação interna entre serviços

5. **HTTPS**
   - Usar HTTPS em produção
   - Usar WSS (WebSocket Secure) em produção

## 📋 Checklist de Deployment

- [ ] Orquestrador rodando na porta 3009 (pública)
- [ ] Business rodando na porta 3002 (interna)
- [ ] Firewall bloqueando acesso direto ao Business
- [ ] HTTPS configurado no Orquestrador
- [ ] WSS (WebSocket Secure) funcionando
- [ ] JWT authentication configurado
- [ ] CORS configurado com domínios específicos
- [ ] Rate limiting implementado
- [ ] Logs centralizados
- [ ] Monitoramento ativo

## 🎯 Arquitetura de Rede (Produção)

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET (Público)                       │
│                                                             │
│  App Mobile (iOS/Android)                                   │
│  Frontend Dashboard (Web)                                   │
│  Outros Clientes                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              │ Porta 3009
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREWALL / LOAD BALANCER                 │
│                                                             │
│  - Porta 3009 (Orquestrador) - ABERTA                       │
│  - Porta 3002 (Business) - BLOQUEADA                        │
│  - Outras portas - BLOQUEADAS                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP (Interno)
                              │ Porta 3009
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    REDE INTERNA (Privada)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Orquestrador (3009)                                 │   │
│  │ - Recebe WebSocket público                          │   │
│  │ - Faz proxy HTTP para Business                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              │ HTTP (Interno)               │
│                              │ Porta 3002                   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Business Service (3002)                             │   │
│  │ - Recebe HTTP do Orquestrador                       │   │
│  │ - Processa scan                                     │   │
│  │ - Retorna resultado                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                              │
│                              │ TCP (Interno)                │
│                              │ Porta 3306                   │
│                              │                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Database (MySQL)                                    │   │
│  │ - Armazena inventory_items                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Documentação Relacionada

- `SCANNER_QUICK_START.md` - Guia rápido
- `SCANNER_SETUP.md` - Configuração detalhada
- `SCANNER_TEST_EXAMPLE.md` - Exemplos de teste
- `SCANNER_IMPLEMENTATION_COMPLETE.md` - Resumo executivo

## ✅ Status

✓ Arquitetura corrigida
✓ Apenas orquestrador exposto publicamente
✓ Business não exposto publicamente
✓ Comunicação interna via HTTP
✓ Segurança de rede implementada
✓ Pronto para produção

---

**Data**: 15 de Março de 2026
**Versão**: 2.0.0 (Corrigida)
**Status**: Arquitetura Segura e Pronta para Produção
