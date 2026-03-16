# Scanner Integration Setup - Business Service

## Visão Geral

A integração de scanner foi implementada no serviço business usando WebSocket (Socket.IO) para comunicação em tempo real entre:
- **App Mobile** - Envia códigos de barras
- **Backend (Business)** - Processa e busca produtos
- **Frontend Dashboard** - Recebe resultados

## Arquivos Criados

```
services/business/src/scanner/
├── scanner.gateway.ts       # WebSocket Gateway
├── scanner.service.ts       # Lógica de processamento
├── scanner.module.ts        # Módulo NestJS
└── dto/
    ├── scan-payload.dto.ts  # DTO de entrada
    └── scan-result.dto.ts   # DTO de saída
```

## Configuração

### 1. Dependências Necessárias

Certifique-se de que o `package.json` possui:

```json
{
  "dependencies": {
    "@nestjs/websockets": "^10.x",
    "@nestjs/platform-socket.io": "^10.x",
    "socket.io": "^4.x",
    "class-validator": "^0.14.x"
  }
}
```

### 2. Variáveis de Ambiente

Adicione ao `.env`:

```env
# Scanner Configuration
SCANNER_NAMESPACE=/scanner
SCANNER_CORS_ORIGIN=*
# Em produção, especifique os domínios permitidos:
# SCANNER_CORS_ORIGIN=http://localhost:3000,https://seu-dashboard.com
```

### 3. Integração no App Module

O `ScannerModule` já foi adicionado ao `app.module.ts`.

## Como Funciona

### Fluxo de Dados

```
┌─────────────┐
│  App Mobile │
└──────┬──────┘
       │ emit('scan', { barcode, timestamp })
       ▼
┌──────────────────────┐
│ ScannerGateway       │
│ - Recebe scan        │
│ - Valida barcode     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ ScannerService       │
│ - Busca em cache     │
│ - Busca no BD        │
│ - Mapeia resultado   │
└──────┬───────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────┐              ┌──────────────────┐
│ App Mobile   │              │ Frontend         │
│ (resposta)   │              │ Dashboard        │
└──────────────┘              └──────────────────┘
```

### Processamento de Scan

1. **Validação**: Verifica se o barcode é válido
2. **Cache**: Busca em cache (TTL: 5 minutos)
3. **Banco de Dados**: Se não estiver em cache, busca no BD
4. **Mapeamento**: Converte InventoryItem para ProductDataDto
5. **Resposta**: Envia resultado para o cliente e broadcast para dashboard

## Exemplos de Uso

### App Mobile (JavaScript/React Native)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002/scanner', {
  query: {
    deviceId: 'mobile-device-1',
    type: 'mobile'
  }
});

// Conectar
socket.on('connect', () => {
  console.log('Conectado ao scanner!');
});

// Enviar scan
function sendScan(barcode) {
  socket.emit('scan', {
    barcode: barcode,
    timestamp: new Date().toISOString()
  });
}

// Receber resultado
socket.on('scan-result', (data) => {
  if (data.product) {
    console.log('Produto encontrado:', data.product.originalName);
    console.log('Preço:', data.product.averagePrice);
  } else {
    console.log('Produto não encontrado');
  }
});

// Usar
sendScan('7896259410133');
```

### Frontend Dashboard (React)

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function ScannerDashboard() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3002/scanner', {
      query: {
        deviceId: 'dashboard-1',
        type: 'dashboard'
      }
    });

    // Escuta novos scans
    socket.on('scan-result', (data) => {
      setScans(prev => [data, ...prev]);
      
      if (data.product) {
        showNotification({
          type: 'success',
          title: 'Produto Escaneado',
          message: data.product.originalName
        });
      } else {
        showNotification({
          type: 'warning',
          title: 'Produto Não Encontrado',
          message: `Barcode: ${data.barcode}`
        });
      }
    });

    // Escuta conexões de dispositivos
    socket.on('client-connected', (data) => {
      console.log('Novo dispositivo:', data.deviceId);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h2>Últimos Scans</h2>
      {scans.map((scan, idx) => (
        <div key={idx}>
          <p>Barcode: {scan.barcode}</p>
          {scan.product && (
            <p>Produto: {scan.product.originalName}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Teste com Postman/Insomnia

1. **URL WebSocket**: `ws://localhost:3002/scanner?deviceId=test&type=mobile`

2. **Enviar evento**:
```json
{
  "event": "scan",
  "data": {
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }
}
```

3. **Resposta esperada**:
```json
{
  "success": true,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T10:30:00.000Z",
  "product": {
    "normalizedName": "Produto Normalizado",
    "originalName": "Produto Original",
    "brand": "Marca",
    "category": "Categoria",
    "unit": "UN",
    "weightKg": "1.5",
    "unitsPerPackage": 12,
    "averagePrice": "25.50",
    "purchaseCount": 5
  }
}
```

## Eventos WebSocket

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `scan` | App → Backend | Envia código de barras |
| `scan-result` | Backend → App/Frontend | Retorna produto encontrado |
| `client-connected` | Backend → Todos | Notifica nova conexão |
| `client-disconnected` | Backend → Todos | Notifica desconexão |

## Estrutura de Dados

### ScanPayloadDto (Entrada)
```typescript
{
  barcode: string;      // Código de barras
  timestamp: string;    // ISO 8601 date
}
```

### ScanResultDto (Saída)
```typescript
{
  success: boolean;
  barcode: string;
  timestamp: string;
  product: ProductDataDto | null;
  error?: string;
}
```

### ProductDataDto
```typescript
{
  normalizedName: string;
  originalName: string;
  brand?: string;
  category?: string;
  unit?: string;
  weightKg?: string;
  unitsPerPackage?: number;
  averagePrice: string;
  purchaseCount: number;
}
```

## Performance e Cache

- **Cache TTL**: 5 minutos
- **Estratégia**: Em memória (Map)
- **Limpeza**: Automática ao expirar

Para limpar cache manualmente:
```typescript
// Limpar cache expirado
scannerService.clearExpiredCache();

// Limpar todo o cache
scannerService.clearAllCache();
```

## Segurança

### CORS
Atualmente configurado para aceitar qualquer origem (`*`). Para produção:

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.SCANNER_CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },
  namespace: '/scanner',
  transports: ['websocket', 'polling'],
})
```

### Validação
- Barcode é validado antes do processamento
- DTOs usam `class-validator` para validação automática

## Troubleshooting

### Conexão recusada
- Verifique se o serviço business está rodando
- Confirme a porta (padrão: 3002)
- Verifique CORS no `.env`

### Produto não encontrado
- Verifique se o barcode existe no banco de dados
- Confirme o campo `barcode` na tabela `inventory_item`
- Verifique se o produto está ativo

### Cache não funciona
- Verifique o TTL (5 minutos)
- Limpe o cache manualmente se necessário

## Próximos Passos

1. Implementar autenticação/autorização
2. Adicionar logging detalhado
3. Implementar retry logic
4. Adicionar métricas de performance
5. Implementar persistência de scans
6. Adicionar validação de duplicatas
