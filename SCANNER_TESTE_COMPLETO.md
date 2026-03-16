# Scanner Integration - Teste Completo

## ✅ Status Atual

O WebSocket está funcionando perfeitamente!

```
✓ Conectado ao Orquestrador (porta 3009)
✓ Rota: /api/business/scanner
✓ Proxy HTTP para Business funcionando
✓ Resposta sendo recebida
```

## 🧪 Teste Completo (Passo a Passo)

### Passo 1: Verificar Banco de Dados

Primeiro, vamos verificar se há produtos no banco:

```bash
# Conectar ao MySQL
mysql -h localhost -u root -p somaai_business

# Listar produtos
SELECT id, barcode, name, salePrice FROM inventory_items LIMIT 5;
```

### Passo 2: Inserir Produto de Teste (se necessário)

Se não houver produtos, inserir um:

```sql
INSERT INTO inventory_items (
  id, 
  establishmentId, 
  barcode, 
  name, 
  category, 
  brand, 
  costPrice, 
  salePrice, 
  quantity, 
  minQuantity, 
  unit, 
  isActive
) VALUES (
  UUID(), 
  'test-establishment', 
  '7896259410133', 
  'Produto Teste Scanner', 
  'Eletrônicos', 
  'Marca Teste', 
  10.00, 
  25.50, 
  100, 
  10, 
  'UN', 
  true
);
```

### Passo 3: Executar Teste

```bash
# Executar o teste
node test-scanner.js
```

### Passo 4: Resultado Esperado

Se o produto foi inserido, você verá:

```
✓ Conectado ao scanner!
✓ Evento client-connected recebido
✓ Resultado recebido:
{
  "success": true,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T23:44:50.784Z",
  "product": {
    "normalizedName": "Produto Teste Scanner",
    "originalName": "Produto Teste Scanner",
    "brand": "Marca Teste",
    "category": "Eletrônicos",
    "unit": "UN",
    "averagePrice": "25.50",
    "purchaseCount": 0
  }
}
✓ Produto encontrado: Produto Teste Scanner
```

## 🔄 Teste de Cache

O cache funciona por 5 minutos. Para testar:

```bash
# Primeira execução (sem cache)
node test-scanner.js
# Tempo: ~7ms

# Segunda execução (com cache)
node test-scanner.js
# Tempo: ~1-2ms (mais rápido)
```

## 🌐 Teste com Múltiplos Clientes

### Terminal 1: Dashboard

```bash
cat > test-dashboard.js << 'EOF'
const io = require('socket.io-client');

const socket = io('http://localhost:3009/api/business/scanner', {
  query: { deviceId: 'dashboard-1', type: 'dashboard' }
});

socket.on('connect', () => {
  console.log('Dashboard conectado!');
});

socket.on('scan-result', (data) => {
  console.log('Dashboard recebeu scan:', data);
});

socket.on('client-connected', (data) => {
  console.log('Novo cliente conectado:', data.deviceId);
});

socket.on('client-disconnected', (data) => {
  console.log('Cliente desconectado:', data.deviceId);
});
EOF

node test-dashboard.js
```

### Terminal 2: Mobile

```bash
node test-scanner.js
```

Resultado esperado:
- Mobile conecta
- Dashboard recebe evento `client-connected`
- Mobile envia scan
- Dashboard recebe evento `scan-result`
- Mobile desconecta
- Dashboard recebe evento `client-disconnected`

## 📊 Teste de Carga

Para testar com múltiplos scans:

```bash
cat > test-load.js << 'EOF'
const io = require('socket.io-client');

const socket = io('http://localhost:3009/api/business/scanner', {
  query: { deviceId: 'load-test', type: 'mobile' }
});

let count = 0;
let startTime = Date.now();

socket.on('connect', () => {
  console.log('Conectado! Enviando 10 scans...');
  
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      socket.emit('scan', {
        barcode: '7896259410133',
        timestamp: new Date().toISOString()
      });
    }, i * 100);
  }
});

socket.on('scan-result', (data) => {
  count++;
  console.log(`Scan ${count}/10 recebido em ${Date.now() - startTime}ms`);
  
  if (count === 10) {
    console.log(`Total: ${Date.now() - startTime}ms`);
    socket.disconnect();
    process.exit(0);
  }
});

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 30000);
EOF

node test-load.js
```

## 🔍 Teste de Erro

Para testar com barcode inválido:

```bash
cat > test-error.js << 'EOF'
const io = require('socket.io-client');

const socket = io('http://localhost:3009/api/business/scanner', {
  query: { deviceId: 'error-test', type: 'mobile' }
});

socket.on('connect', () => {
  console.log('Enviando barcode inválido...');
  
  socket.emit('scan', {
    barcode: '',  // Barcode vazio
    timestamp: new Date().toISOString()
  });
});

socket.on('scan-result', (data) => {
  console.log('Resultado:', JSON.stringify(data, null, 2));
  socket.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('Timeout');
  process.exit(1);
}, 10000);
EOF

node test-error.js
```

Resultado esperado:
```json
{
  "success": false,
  "barcode": "",
  "product": null,
  "error": "Barcode inválido"
}
```

## 📈 Monitoramento

### Logs do Orquestrador

```bash
# Terminal 1
cd services/orchestrator
npm run start:dev
```

Você verá logs como:
```
[ScannerGateway] Cliente conectado: i46zlw3imTo44r76AAAB (mobile - test-device)
[ScannerGateway] Scan recebido de test-device: 7896259410133
[ScannerGateway] Scan processado: 7896259410133 - Produto encontrado
```

### Logs do Business

```bash
# Terminal 2
cd services/business
npm run start:dev
```

Você verá logs como:
```
[ScannerController] POST /scanner/process
[ScannerService] Processando scan: 7896259410133
[ScannerService] Produto encontrado em cache
```

## ✅ Checklist de Testes

- [ ] Teste básico (produto não encontrado)
- [ ] Teste com produto real
- [ ] Teste de cache
- [ ] Teste com múltiplos clientes
- [ ] Teste de carga
- [ ] Teste de erro
- [ ] Monitoramento de logs
- [ ] Teste com autenticação JWT
- [ ] Teste com HTTPS/WSS
- [ ] Teste de desconexão

## 🎯 Próximos Passos

1. ✅ Executar teste básico
2. ⏳ Inserir produto de teste
3. ⏳ Executar teste completo
4. ⏳ Testar cache
5. ⏳ Testar múltiplos clientes
6. ⏳ Adicionar autenticação JWT
7. ⏳ Deploy em produção

## 📞 Troubleshooting

### Erro: "Cannot connect to localhost:3009"
- Verificar se Orquestrador está rodando
- Verificar porta: `lsof -i :3009`

### Erro: "Produto não encontrado"
- Verificar se produto existe no BD
- Verificar barcode correto
- Inserir produto de teste

### Erro: "Timeout"
- Verificar logs do Orquestrador
- Verificar logs do Business
- Verificar conexão com BD

### Erro: "Cannot find module 'socket.io-client'"
- Instalar: `npm install socket.io-client`

---

**Status**: ✅ Pronto para Testes Completos
**Próximo**: Inserir produto e executar teste completo
