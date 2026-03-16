# Scanner Integration - Mudanças com Orquestrador

## ✅ Arquivos Criados

### Orquestrador (`services/orchestrator/src/business/`)

```
scanner.gateway.ts          # WebSocket Gateway (proxy para Business)
scanner.module.ts           # Módulo NestJS
```

### Business (`services/business/src/scanner/`)

```
scanner.controller.ts       # Controller HTTP para receber requisições do Orquestrador
scanner.gateway.ts          # WebSocket Gateway (comunicação direta - opcional)
scanner.service.ts          # Lógica de processamento
scanner.module.ts           # Módulo NestJS
dto/
  ├── scan-payload.dto.ts   # DTO de entrada
  └── scan-result.dto.ts    # DTO de saída
```

## 📝 Modificações em Arquivos Existentes

### `services/orchestrator/src/business/business.module.ts`

```typescript
// Adicionado:
import { ScannerModule } from './scanner.module';

// No imports:
imports: [HttpModule, CommonModule, ScannerModule],
```

### `services/business/src/scanner/scanner.module.ts`

```typescript
// Adicionado:
import { ScannerController } from './scanner.controller';

// No controllers:
controllers: [ScannerController],
```

### `services/orchestrator/package.json`

```json
{
  "dependencies": {
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "socket.io": "^4.7.0"
  }
}
```

### `services/business/package.json`

```json
{
  "dependencies": {
    "@nestjs/platform-socket.io": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "socket.io": "^4.7.0"
  }
}
```

## 🔄 Fluxo de Requisições

### Antes (Sem Orquestrador)

```
App Mobile
    ↓
Business Service (WebSocket)
    ↓
Database
```

### Depois (Com Orquestrador)

```
App Mobile
    ↓
Orquestrador (WebSocket)
    ↓
Business Service (HTTP)
    ↓
Database
```

## 🌐 Endpoints

### Orquestrador

- **WebSocket**: `ws://localhost:3009/api/business/scanner`
- **Eventos**: `scan`, `scan-result`, `client-connected`, `client-disconnected`

### Business

- **WebSocket**: `ws://localhost:3002/scanner` (opcional, para comunicação direta)
- **HTTP**: `POST /scanner/process` (recebe requisições do Orquestrador)

## 📊 Componentes por Serviço

### Orquestrador

| Arquivo | Responsabilidade |
|---------|------------------|
| `scanner.gateway.ts` | Recebe WebSocket, faz proxy HTTP para Business |
| `scanner.module.ts` | Módulo NestJS com HttpModule |
| `business.module.ts` | Importa ScannerModule |

### Business

| Arquivo | Responsabilidade |
|---------|------------------|
| `scanner.controller.ts` | Endpoint HTTP `/scanner/process` |
| `scanner.gateway.ts` | WebSocket direto (opcional) |
| `scanner.service.ts` | Lógica de processamento |
| `scanner.module.ts` | Módulo NestJS com Controller |

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
# Business
cd services/business
npm install --legacy-peer-deps

# Orquestrador
cd services/orchestrator
npm install --legacy-peer-deps
```

### 2. Iniciar Serviços

```bash
# Terminal 1 - Business
cd services/business
npm run start:dev

# Terminal 2 - Orquestrador
cd services/orchestrator
npm run start:dev
```

### 3. Conectar App Mobile

```javascript
// Conectar ao Orquestrador (porta 3009, rota /api/business/scanner)
const socket = io('http://localhost:3009/api/business/scanner', {
  query: {
    deviceId: 'mobile-1',
    type: 'mobile'
  }
});

socket.emit('scan', {
  barcode: '7896259410133',
  timestamp: new Date().toISOString()
});

socket.on('scan-result', (data) => {
  console.log('Resultado:', data);
});
```

## 🧪 Teste

### HTTP (Business)

```bash
curl -X POST http://localhost:3002/scanner/process \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }'
```

### WebSocket (Orquestrador)

```bash
websocat "ws://localhost:3009/api/business/scanner?deviceId=test&type=mobile"

# Enviar:
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T10:30:00.000Z"}}
```

## 📋 Checklist

- [x] Criar ScannerGateway no Orquestrador
- [x] Criar ScannerModule no Orquestrador
- [x] Criar ScannerController no Business
- [x] Atualizar ScannerModule do Business
- [x] Adicionar dependências ao Orquestrador
- [x] Adicionar dependências ao Business
- [x] Instalar dependências
- [x] Sem erros de compilação
- [ ] Testar com App Mobile
- [ ] Testar com Frontend Dashboard
- [ ] Adicionar autenticação JWT
- [ ] Adicionar rate limiting

## 🔐 Segurança

### Recomendações

1. **Autenticação**: Adicionar JWT validation no Business Service
2. **CORS**: Configurar domínios permitidos em produção
3. **Rate Limiting**: Limitar requisições por dispositivo
4. **Validação**: Validar barcode format
5. **Logging**: Registrar todas as operações

### Exemplo de Autenticação (Futuro)

```typescript
// No Business Service
@Post('process')
@UseGuards(JwtAuthGuard)
async processScan(@Body() payload: ScanPayloadDto): Promise<ScanResultDto> {
  return this.scannerService.processScan(payload);
}
```

## 📚 Documentação

- `SCANNER_SETUP.md` - Guia completo
- `SCANNER_TEST_EXAMPLE.md` - Exemplos de teste
- `SCANNER_IMPLEMENTATION_SUMMARY.md` - Resumo da implementação
- `SCANNER_ARCHITECTURE_WITH_ORCHESTRATOR.md` - Arquitetura com Orquestrador

## 🎯 Status

✅ Implementação completa
✅ Sem erros de compilação
✅ Pronto para testes
⏳ Aguardando integração com App Mobile
⏳ Aguardando integração com Frontend Dashboard

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs do Orquestrador
2. Verificar logs do Business Service
3. Testar endpoint HTTP diretamente
4. Testar WebSocket com websocat
