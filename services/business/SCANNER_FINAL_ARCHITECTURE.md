# Scanner Integration - Arquitetura Final

## 🏗️ Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SCANNER INTEGRATION FINAL                       │
└─────────────────────────────────────────────────────────────────────┘

CAMADA DE APRESENTAÇÃO
┌──────────────┐         ┌──────────────────┐
│  App Mobile  │         │  Frontend        │
│  (React      │         │  Dashboard       │
│   Native)    │         │  (React)         │
└──────┬───────┘         └────────┬─────────┘
       │                          │
       │ WebSocket                │ WebSocket
       │ (Socket.IO)              │ (Socket.IO)
       │                          │
       └──────────────┬───────────┘
                      │
                      ▼
CAMADA DE ORQUESTRAÇÃO
┌─────────────────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR (Porta 3001)                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ScannerGateway                                               │  │
│  │ - Recebe WebSocket                                           │  │
│  │ - Valida conexão                                             │  │
│  │ - Faz proxy HTTP para Business                               │  │
│  │ - Broadcast de resultados                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              │ /scanner/process
                              │
                              ▼
CAMADA DE NEGÓCIO
┌─────────────────────────────────────────────────────────────────────┐
│                    BUSINESS SERVICE (Porta 3002)                    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ScannerController                                            │  │
│  │ - Endpoint: POST /scanner/process                            │  │
│  │ - Recebe requisições do Orquestrador                         │  │
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
│  │ ScannerGateway (Opcional)                                    │  │
│  │ - WebSocket direto (localhost:3002/scanner)                  │  │
│  │ - Para comunicação direta sem Orquestrador                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ SELECT
                              │ FROM inventory_items
                              │ WHERE barcode = ?
                              │
                              ▼
CAMADA DE DADOS
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ inventory_items                                              │  │
│  │ - id (UUID)                                                  │  │
│  │ - barcode (VARCHAR, UNIQUE)                                  │  │
│  │ - name (VARCHAR)                                             │  │
│  │ - category (VARCHAR)                                         │  │
│  │ - brand (VARCHAR)                                            │  │
│  │ - salePrice (DECIMAL)                                        │  │
│  │ - unit (VARCHAR)                                             │  │
│  │ - ... outros campos                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Fluxo de Dados Completo

```
1. CONEXÃO
   App Mobile
   └─ WebSocket: ws://localhost:3001/scanner?deviceId=mobile-1&type=mobile
      └─ Orquestrador recebe conexão
         └─ Armazena em connectedClients

2. ENVIO DE SCAN
   App Mobile
   └─ emit('scan', { barcode: '7896259410133', timestamp: '...' })
      └─ Orquestrador recebe evento
         └─ Valida payload
            └─ HTTP POST http://business:3002/scanner/process
               └─ Business recebe requisição
                  └─ ScannerController.processScan()
                     └─ ScannerService.processScan()
                        ├─ Valida barcode
                        ├─ Busca em cache
                        │  └─ Se encontrado: retorna
                        │  └─ Se não encontrado: próximo passo
                        ├─ Busca no banco de dados
                        │  └─ SELECT * FROM inventory_items WHERE barcode = ?
                        ├─ Mapeia resultado
                        └─ Retorna ScanResultDto

3. RESPOSTA
   Business
   └─ HTTP 200 OK
      └─ { success: true, product: {...} }
         └─ Orquestrador recebe resposta
            └─ Armazena em cache
               └─ emit('scan-result', result) para App Mobile
                  └─ broadcast('scan-result', result) para Dashboard

4. RECEBIMENTO
   App Mobile
   └─ on('scan-result', (data) => { ... })
      └─ Exibe resultado

   Frontend Dashboard
   └─ on('scan-result', (data) => { ... })
      └─ Atualiza UI
```

## 🔄 Estados e Transições

```
┌─────────────┐
│ DESCONECTADO│
└──────┬──────┘
       │ WebSocket connect
       ▼
┌─────────────────────┐
│ CONECTADO           │
│ (aguardando scan)   │
└──────┬──────────────┘
       │ emit('scan')
       ▼
┌─────────────────────┐
│ PROCESSANDO         │
│ (HTTP POST)         │
└──────┬──────────────┘
       │ Resposta recebida
       ▼
┌─────────────────────┐
│ RESULTADO ENVIADO   │
│ (aguardando scan)   │
└──────┬──────────────┘
       │ emit('scan') ou disconnect
       ▼
┌─────────────┐
│ DESCONECTADO│
└─────────────┘
```

## 📈 Sequência de Mensagens

```
App Mobile          Orquestrador        Business        Database
    │                   │                   │               │
    │─ WebSocket ──────►│                   │               │
    │  connect          │                   │               │
    │                   │                   │               │
    │─ emit('scan') ───►│                   │               │
    │  {barcode, ts}    │                   │               │
    │                   │─ HTTP POST ──────►│               │
    │                   │  /scanner/process │               │
    │                   │                   │               │
    │                   │                   │─ SELECT ─────►│
    │                   │                   │  barcode      │
    │                   │                   │               │
    │                   │                   │◄─ Result ─────│
    │                   │                   │               │
    │                   │◄─ HTTP 200 ───────│               │
    │                   │  {product}        │               │
    │                   │                   │               │
    │◄─ emit('scan-result') ─────────────────────────────────│
    │  {product}        │                   │               │
    │                   │                   │               │
    │                   │─ broadcast ──────►│ (Dashboard)   │
    │                   │  'scan-result'    │               │
    │                   │                   │               │
```

## 🎯 Casos de Uso

### Caso 1: Produto Encontrado

```
Input:  { barcode: '7896259410133', timestamp: '2026-03-15T10:30:00Z' }
        ↓
Process: Busca em cache → Não encontrado
         Busca no BD → Encontrado
         Mapeia resultado
        ↓
Output: {
  success: true,
  barcode: '7896259410133',
  timestamp: '2026-03-15T10:30:00Z',
  product: {
    normalizedName: 'Produto',
    originalName: 'Produto Original',
    brand: 'Marca',
    category: 'Categoria',
    unit: 'UN',
    averagePrice: '25.50',
    purchaseCount: 5
  }
}
```

### Caso 2: Produto Não Encontrado

```
Input:  { barcode: '9999999999999', timestamp: '2026-03-15T10:30:00Z' }
        ↓
Process: Busca em cache → Não encontrado
         Busca no BD → Não encontrado
        ↓
Output: {
  success: false,
  barcode: '9999999999999',
  timestamp: '2026-03-15T10:30:00Z',
  product: null
}
```

### Caso 3: Barcode Inválido

```
Input:  { barcode: '', timestamp: '2026-03-15T10:30:00Z' }
        ↓
Process: Valida barcode → Inválido
        ↓
Output: {
  success: false,
  barcode: '',
  timestamp: '2026-03-15T10:30:00Z',
  product: null,
  error: 'Barcode inválido'
}
```

### Caso 4: Serviço Indisponível

```
Input:  { barcode: '7896259410133', timestamp: '2026-03-15T10:30:00Z' }
        ↓
Process: Orquestrador tenta HTTP POST
         Business Service não responde
        ↓
Output: {
  success: false,
  barcode: '7896259410133',
  timestamp: '2026-03-15T10:30:00Z',
  product: null,
  error: 'Serviço indisponível'
}
```

## 🔐 Segurança

### Camadas de Proteção

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CORS (Orquestrador)                                      │
│    - Validar origem das requisições WebSocket               │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDAÇÃO DE ENTRADA (Orquestrador)                      │
│    - Validar deviceId, type                                 │
│    - Validar payload do scan                                │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 3. AUTENTICAÇÃO (Business - Futuro)                         │
│    - JWT validation                                         │
│    - Verificar permissões                                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 4. RATE LIMITING (Futuro)                                   │
│    - Limitar requisições por dispositivo                    │
│    - Limitar requisições por IP                             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│ 5. LOGGING E MONITORAMENTO                                  │
│    - Registrar todas as operações                           │
│    - Alertas de anomalias                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Performance

### Cache

```
Primeira requisição (cache miss):
  Barcode → Busca no BD → 50-100ms → Armazena em cache

Segunda requisição (cache hit):
  Barcode → Encontrado em cache → 1-5ms

TTL: 5 minutos
Estratégia: LRU (Least Recently Used)
```

### Escalabilidade

```
Requisições por segundo:
  - Sem cache: ~100 req/s (limitado pelo BD)
  - Com cache: ~1000 req/s (em memória)

Conexões simultâneas:
  - Orquestrador: ~10.000 (Node.js)
  - Business: ~1.000 (NestJS)
```

## 🚀 Deployment

### Docker Compose

```yaml
version: '3.8'

services:
  orchestrator:
    image: somaai/orchestrator:latest
    ports:
      - "3001:3001"
    environment:
      - BUSINESS_SERVICE_URL=http://business:3002
    depends_on:
      - business

  business:
    image: somaai/business:latest
    ports:
      - "3002:3002"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=password
      - DB_DATABASE=somaai_business
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=somaai_business
```

## 📚 Documentação Relacionada

- `SCANNER_SETUP.md` - Guia de configuração
- `SCANNER_TEST_EXAMPLE.md` - Exemplos de teste
- `SCANNER_IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `SCANNER_ARCHITECTURE_WITH_ORCHESTRATOR.md` - Arquitetura detalhada
- `SCANNER_ORCHESTRATOR_CHANGES.md` - Mudanças realizadas

## ✅ Checklist de Implementação

- [x] Criar ScannerGateway no Orquestrador
- [x] Criar ScannerModule no Orquestrador
- [x] Criar ScannerController no Business
- [x] Criar ScannerService no Business
- [x] Criar DTOs
- [x] Instalar dependências
- [x] Sem erros de compilação
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes de carga
- [ ] Documentação de API
- [ ] Deployment em produção

## 🎯 Próximos Passos

1. **Testes**: Executar testes com App Mobile
2. **Autenticação**: Adicionar JWT validation
3. **Monitoramento**: Adicionar métricas Prometheus
4. **Otimização**: Implementar circuit breaker
5. **Persistência**: Salvar histórico de scans
6. **Validação**: Detectar scans duplicados
