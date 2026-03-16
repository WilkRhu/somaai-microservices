# Integração Scanner - App ↔ Backend ↔ Frontend

## Visão Geral do Fluxo

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   App       │────▶│  Backend         │────▶│  Frontend       │
│  (Mobile)   │     │  (WebSocket)     │     │  (Dashboard)    │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                    │                        │
       │  emit('scan', {})  │  emit('scan-result')   │
       │───────────────────▶│───────────────────────▶│
       │                    │                        │
```

## 1. App Mobile - Envio do Scan

```javascript
import { io } from 'socket.io-client';

const socket = io('http://SEU_SERVIDOR:3002/scanner', {
  query: {
    deviceId: 'id-do-dispositivo',
    type: 'mobile'
  }
});

// Escuta conexão
socket.on('connect', () => {
  console.log('Conectado ao scanner!');
});

// Envia scan
function sendScan(barcode) {
  socket.emit('scan', {
    barcode: barcode,
    timestamp: new Date().toISOString()
  });
}

// Recebe resultado
socket.on('scan-result', (data) => {
  console.log('Produto encontrado:', data.product);
  if (data.product) {
    // Exibe produto encontrado
  } else {
    // Produto não encontrado
  }
});
```

## 2. Backend - ScannerGateway

A gateway já está configurada em `src/modules/scanner/scanner.gateway.ts`:

- **Namespace:** `/scanner`
- **Evento de entrada:** `scan`
- **Evento de saída:** `scan-result`
- **Broadcast:** Envia para sala `dashboard` e confirmação para o mobile

### Estrutura do Payload de Entrada

```typescript
interface ScanPayload {
  barcode: string;      // Código de barras
  timestamp: string;    // ISO date
}
```

### Estrutura do Payload de Saída

```typescript
interface ScanResult {
  success: boolean;
  barcode: string;
  timestamp: string;
  product: ProductData | null;
  fromDevice: string;
}

interface ProductData {
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

## 3. Frontend Dashboard - Recebimento

```javascript
import { io } from 'socket.io-client';

const socket = io('http://SEU_SERVIDOR:3002/scanner', {
  query: {
    deviceId: 'dashboard-1',
    type: 'dashboard'
  }
});

// Escuta novos scans
socket.on('scan-result', (data) => {
  if (data.product) {
    // Exibe notificação de produto encontrado
    showNotification({
      type: 'success',
      title: 'Produto Escaneado',
      message: `${data.product.originalName}`,
      product: data.product
    });
  } else {
    // Produto não encontrado
    showNotification({
      type: 'warning',
      title: 'Produto Não Encontrado',
      message: `Barcode: ${data.barcode}`
    });
  }
});

// Opcional: escuta conexões de dispositivos
socket.on('client-connected', (data) => {
  console.log('Novo dispositivo conectado:', data);
});
```

## 4. Configuração de CORS

O backend já está configurado para aceitar conexões de qualquer origem:

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',  // Em produção, especifique os domínios permitidos
  },
  namespace: '/scanner',
  transports: ['websocket', 'polling'],
})
```

## 5. Variáveis de Ambiente

No `.env` do backend:

```env
PORT=3002
# Para produção, configure o CORS especificamente
CORS_ORIGIN=http://localhost:3000,https://seu-dashboard.com
```

## 6. Teste com Postman/Insomnia

```json
// WebSocket URL
ws://localhost:3002/scanner?deviceId=test&type=mobile

// Evento para enviar
{
  "event": "scan",
  "data": {
    "barcode": "7896259410133",
    "timestamp": "2026-03-09T18:13:07.199Z"
  }
}
```

## 7. Tabela de Eventos

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `scan` | App → Backend | Envia código de barras |
| `scan-result` | Backend → App/Frontend | Retorna produto encontrado |
| `client-connected` | Backend → Todos | Notifica nova conexão |
| `client-disconnected` | Backend → Todos | Notifica desconexão |

## 8. Próximos Passos

1. **App Mobile:** Implementar conexão WebSocket com o namespace `/scanner`
2. **Frontend:** Adicionar listener para `scan-result` no dashboard
3. **Backend:** Ajustar retorno do produto conforme necessidade do front
4. **Validação:** Adicionar validação de barcode duplicado
5. **Cache:** Implementar cache de produtos para melhorar performance