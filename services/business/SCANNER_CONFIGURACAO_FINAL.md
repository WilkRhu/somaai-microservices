# Scanner Integration - Configuração Final ✅

## 🎯 Rota Correta

```
ws://seu-servidor:3009/scanner
```

## 📝 Configuração Correta

### App Mobile (PDV)

```javascript
import { io } from 'socket.io-client';

const apiUrl = 'https://seu-servidor:3009';
const userId = 'user-id-do-usuario';

const socket = io(`${apiUrl}/scanner`, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 3,
  query: {
    type: 'pdv',
    userId,
  },
});

socket.on('connect', () => {
  console.log('Conectado ao scanner!');
});

socket.emit('scan', {
  barcode: '7896259410133',
  timestamp: new Date().toISOString()
});

socket.on('scan-result', (data) => {
  if (data.product) {
    console.log('Produto:', data.product.originalName);
  } else {
    console.log('Produto não encontrado');
  }
});
```

### Frontend Dashboard

```javascript
import { io } from 'socket.io-client';

const apiUrl = 'https://seu-servidor:3009';
const userId = 'user-id-do-usuario';

const socket = io(`${apiUrl}/scanner`, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 3,
  query: {
    type: 'dashboard',
    userId,
  },
});

socket.on('scan-result', (data) => {
  console.log('Novo scan:', data);
  // Atualizar UI
});

socket.on('client-connected', (data) => {
  console.log('Novo cliente:', data);
});
```

## 📊 Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `type` | string | `'pdv'` ou `'dashboard'` |
| `userId` | string | ID do usuário conectado |

## 🔄 Eventos

### Enviados pelo Cliente

```javascript
socket.emit('scan', {
  barcode: '7896259410133',
  timestamp: new Date().toISOString()
});
```

### Recebidos pelo Cliente

```javascript
// Resultado do scan
socket.on('scan-result', (data) => {
  // {
  //   success: boolean,
  //   barcode: string,
  //   timestamp: string,
  //   product: ProductData | null
  // }
});

// Notificação de nova conexão
socket.on('client-connected', (data) => {
  // {
  //   clientId: string,
  //   type: 'pdv' | 'dashboard',
  //   userId: string,
  //   timestamp: string
  // }
});

// Notificação de desconexão
socket.on('client-disconnected', (data) => {
  // {
  //   clientId: string,
  //   type: 'pdv' | 'dashboard',
  //   userId: string,
  //   timestamp: string
  // }
});
```

## 🧪 Teste

```bash
node test-scanner.js
```

Resultado esperado:
```
✓ Conectado ao scanner!
✓ Evento client-connected recebido
✓ Resultado recebido
```

## 📈 Opções de Conexão

```javascript
const socket = io(`${apiUrl}/scanner`, {
  transports: ['websocket', 'polling'],  // Tenta WebSocket primeiro, depois polling
  reconnectionAttempts: 3,                // Número de tentativas de reconexão
  reconnectionDelay: 1000,                // Delay entre tentativas (ms)
  reconnectionDelayMax: 5000,             // Delay máximo (ms)
  query: {
    type: 'pdv',                          // Tipo de cliente
    userId: 'user-123',                   // ID do usuário
  },
});
```

## ✅ Checklist

- [x] Rota correta: `/scanner`
- [x] Query parameters: `type` e `userId`
- [x] Transports: `websocket` e `polling`
- [x] Reconnection: 3 tentativas
- [x] Teste funcionando
- [ ] Integrar com App Mobile
- [ ] Integrar com Frontend Dashboard
- [ ] Adicionar autenticação JWT
- [ ] Deploy em produção

## 🎯 Próximos Passos

1. Copiar configuração para seu App Mobile
2. Copiar configuração para seu Frontend Dashboard
3. Testar conexão
4. Adicionar autenticação JWT
5. Deploy em produção

---

**Status**: ✅ Configuração Final Validada
**Teste**: ✅ Funcionando
**Pronto para Integração**: ✅ Sim
