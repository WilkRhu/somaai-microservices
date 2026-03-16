# Scanner Integration - Quick Start Guide

## ⚡ 5 Minutos para Começar

### 1️⃣ Instalar Dependências (2 min)

```bash
# Business Service
cd services/business
npm install --legacy-peer-deps

# Orquestrador
cd services/orchestrator
npm install --legacy-peer-deps
```

### 2️⃣ Iniciar Serviços (1 min)

```bash
# Terminal 1 - Business Service
cd services/business
npm run start:dev

# Terminal 2 - Orquestrador
cd services/orchestrator
npm run start:dev
```

### 3️⃣ Testar com WebSocket (1 min)

```bash
# Instalar websocat (se não tiver)
# macOS: brew install websocat
# Linux: cargo install websocat

# Conectar ao Orquestrador (porta 3009, namespace /scanner)
websocat "ws://localhost:3009/scanner?deviceId=test&type=mobile"

# Enviar scan (copie e cole):
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T10:30:00.000Z"}}
```

### 4️⃣ Testar HTTP Direto (Opcional)

```bash
# Teste HTTP direto no Business (para debug)
curl -X POST http://localhost:3002/scanner/process \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }'
```

## 🎯 Próximos Passos

### Integrar com App Mobile

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

socket.emit('scan', {
  barcode: '7896259410133',
  timestamp: new Date().toISOString()
});

socket.on('scan-result', (data) => {
  console.log('Resultado:', data);
});
```

### Integrar com Frontend Dashboard

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
```

## 📊 Resposta Esperada

### Sucesso

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

### Erro

```json
{
  "success": false,
  "barcode": "9999999999999",
  "timestamp": "2026-03-15T10:30:00.000Z",
  "product": null
}
```

## 🔧 Troubleshooting

### Erro: "Cannot find module 'socket.io'"

```bash
npm install --legacy-peer-deps
```

### Erro: "Connection refused"

- Verificar se Business está rodando: `http://localhost:3002`
- Verificar se Orquestrador está rodando: `http://localhost:3009`

### Erro: "Produto não encontrado"

- Verificar se o barcode existe no banco
- Verificar se o produto está ativo

### Erro: "Serviço indisponível"

- Verificar logs do Business
- Verificar se Business está respondendo: `curl http://localhost:3002/health`

## 📚 Documentação Completa

- `SCANNER_SETUP.md` - Guia detalhado
- `SCANNER_TEST_EXAMPLE.md` - Exemplos em várias linguagens
- `SCANNER_FINAL_ARCHITECTURE.md` - Arquitetura completa
- `SCANNER_IMPLEMENTATION_COMPLETE.md` - Resumo executivo

## 🎓 Exemplos Rápidos

### Node.js

```bash
# Criar arquivo test-scanner.js
cat > test-scanner.js << 'EOF'
const io = require('socket.io-client');

const apiUrl = 'http://localhost:3009';
const userId = 'test-user-123';

const socket = io(`${apiUrl}/scanner`, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 3,
  query: {
    type: 'pdv',
    userId,
  },
});

socket.on('connect', () => {
  console.log('Conectado!');
  socket.emit('scan', {
    barcode: '7896259410133',
    timestamp: new Date().toISOString()
  });
});

socket.on('scan-result', (data) => {
  console.log('Resultado:', JSON.stringify(data, null, 2));
  socket.disconnect();
});
EOF

# Executar
node test-scanner.js
```

### Python

```bash
# Criar arquivo test_scanner.py
cat > test_scanner.py << 'EOF'
import socketio
import json
from datetime import datetime

sio = socketio.Client()

@sio.event
def connect():
    print('Conectado!')
    sio.emit('scan', {
        'barcode': '7896259410133',
        'timestamp': datetime.now().isoformat()
    })

@sio.event
def scan_result(data):
    print('Resultado:', json.dumps(data, indent=2))
    sio.disconnect()

sio.connect('http://localhost:3009/scanner', {
  'query': {
    'type': 'pdv',
    'userId': 'test-user-123'
  }
})
sio.wait()
EOF

# Executar
pip install python-socketio python-engineio
python test_scanner.py
```

## 🚀 Deployment

### Docker

```bash
# Build
docker build -t somaai/business:latest services/business
docker build -t somaai/orchestrator:latest services/orchestrator

# Run
docker run -p 3002:3002 somaai/business:latest
docker run -p 3001:3001 -e BUSINESS_SERVICE_URL=http://business:3002 somaai/orchestrator:latest
```

### Docker Compose

```bash
docker-compose up -d
```

## ✅ Checklist

- [ ] Dependências instaladas
- [ ] Business rodando na porta 3002
- [ ] Orquestrador rodando na porta 3009
- [ ] Teste HTTP funcionando (opcional, para debug)
- [ ] Teste WebSocket funcionando (conectar ao orquestrador na porta 3009)
- [ ] App Mobile conectando ao orquestrador
- [ ] Dashboard recebendo eventos
- [ ] Produto encontrado no BD
- [ ] Cache funcionando
- [ ] Pronto para produção

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| Módulo não encontrado | `npm install --legacy-peer-deps` |
| Porta em uso | `lsof -i :3001` ou `lsof -i :3002` |
| Banco não conecta | Verificar `.env` |
| Produto não encontrado | Verificar barcode no BD |
| WebSocket não conecta | Verificar CORS |

## 🎯 Próximas Ações

1. ✅ Instalar e testar
2. ⏳ Integrar com App Mobile
3. ⏳ Integrar com Frontend
4. ⏳ Adicionar autenticação
5. ⏳ Deploy em produção

---

**Tempo estimado**: 5 minutos
**Dificuldade**: Fácil
**Status**: Pronto para usar
