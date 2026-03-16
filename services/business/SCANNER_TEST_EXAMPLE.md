# Scanner Integration - Exemplos de Teste

## ⚠️ IMPORTANTE: Conectar ao ORQUESTRADOR

Todos os testes devem se conectar ao **ORQUESTRADOR (porta 3001)**, não ao Business (porta 3002).

```
App Mobile/Frontend → Orquestrador (3001) → Business (3002)
```

## 1. Teste com cURL (WebSocket)

### Usando websocat (ferramenta CLI para WebSocket)

```bash
# Instalar websocat (se não tiver)
# macOS: brew install websocat
# Linux: cargo install websocat
# Windows: choco install websocat

# Conectar ao ORQUESTRADOR (porta 3001)
websocat "ws://localhost:3001/scanner?deviceId=mobile-1&type=mobile"

# Enviar um scan (em outra aba do terminal)
# Copie e cole no terminal websocat:
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T10:30:00.000Z"}}
```

## 2. Teste com Node.js

Crie um arquivo `test-scanner.js`:

```javascript
const io = require('socket.io-client');

// Conectar ao ORQUESTRADOR (porta 3001)
const socket = io('http://localhost:3001/scanner', {
  query: {
    deviceId: 'mobile-test-1',
    type: 'mobile'
  }
});

socket.on('connect', () => {
  console.log('✓ Conectado ao orquestrador!');
  
  // Enviar um scan
  socket.emit('scan', {
    barcode: '7896259410133',
    timestamp: new Date().toISOString()
  });
});

socket.on('scan-result', (data) => {
  console.log('✓ Resultado recebido:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.product) {
    console.log(`✓ Produto encontrado: ${data.product.originalName}`);
  } else {
    console.log('✗ Produto não encontrado');
  }
  
  socket.disconnect();
});

socket.on('error', (error) => {
  console.error('✗ Erro:', error);
  socket.disconnect();
});

socket.on('disconnect', () => {
  console.log('Desconectado');
  process.exit(0);
});

// Timeout de 10 segundos
setTimeout(() => {
  console.error('✗ Timeout - nenhuma resposta recebida');
  socket.disconnect();
  process.exit(1);
}, 10000);
```

Executar:
```bash
node test-scanner.js
```

## 3. Teste com Postman

### Configurar WebSocket no Postman

1. Abrir Postman
2. Criar nova requisição
3. Mudar tipo para "WebSocket"
4. URL: `ws://localhost:3001/scanner?deviceId=postman-test&type=mobile`
5. Conectar
6. Enviar mensagem:

```json
{
  "event": "scan",
  "data": {
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }
}
```

## 4. Teste com React (Frontend)

Crie um componente `ScannerTest.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function ScannerTest() {
  const [connected, setConnected] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [barcode, setBarcode] = useState('7896259410133');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Conectar ao ORQUESTRADOR (porta 3001)
    const newSocket = io('http://localhost:3001/scanner', {
      query: {
        deviceId: 'react-test',
        type: 'dashboard'
      }
    });

    newSocket.on('connect', () => {
      console.log('Conectado!');
      setConnected(true);
    });

    newSocket.on('scan-result', (data) => {
      console.log('Resultado:', data);
      setResults(prev => [data, ...prev]);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const handleScan = () => {
    if (socket) {
      socket.emit('scan', {
        barcode,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Scanner Test</h2>
      
      <div>
        Status: <span style={{ color: connected ? 'green' : 'red' }}>
          {connected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Barcode"
        />
        <button onClick={handleScan} disabled={!connected}>
          Enviar Scan
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Resultados:</h3>
        {results.map((result, idx) => (
          <div key={idx} style={{ 
            border: '1px solid #ccc', 
            padding: '10px', 
            marginBottom: '10px',
            backgroundColor: result.product ? '#e8f5e9' : '#fff3e0'
          }}>
            <p><strong>Barcode:</strong> {result.barcode}</p>
            {result.product ? (
              <>
                <p><strong>Produto:</strong> {result.product.originalName}</p>
                <p><strong>Preço:</strong> R$ {result.product.averagePrice}</p>
                <p><strong>Marca:</strong> {result.product.brand}</p>
              </>
            ) : (
              <p style={{ color: 'red' }}>Produto não encontrado</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 5. Teste com React Native (Mobile)

```typescript
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { io } from 'socket.io-client';

export function ScannerMobileTest() {
  const [connected, setConnected] = useState(false);
  const [barcode, setBarcode] = useState('7896259410133');
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Conectar ao ORQUESTRADOR (porta 3001)
    const socket = io('http://localhost:3001/scanner', {
      query: {
        deviceId: 'mobile-test',
        type: 'mobile'
      }
    });

    socket.on('connect', () => {
      setConnected(true);
      setError('');
    });

    socket.on('scan-result', (data) => {
      if (data.product) {
        setProduct(data.product);
        setError('');
      } else {
        setProduct(null);
        setError('Produto não encontrado');
      }
    });

    socket.on('error', (err) => {
      setError(err.message);
    });

    return () => socket.disconnect();
  }, []);

  const handleScan = () => {
    // Aqui você integraria com a câmera/scanner real
    // Por enquanto, apenas envia o barcode manualmente
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Scanner Mobile
      </Text>

      <Text style={{ marginTop: 10, color: connected ? 'green' : 'red' }}>
        {connected ? '✓ Conectado' : '✗ Desconectado'}
      </Text>

      <TextInput
        style={{ 
          borderWidth: 1, 
          padding: 10, 
          marginTop: 20,
          borderRadius: 5
        }}
        placeholder="Barcode"
        value={barcode}
        onChangeText={setBarcode}
      />

      <Button 
        title="Escanear" 
        onPress={handleScan}
        disabled={!connected}
      />

      {product && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#e8f5e9' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {product.originalName}
          </Text>
          <Text>Preço: R$ {product.averagePrice}</Text>
          <Text>Marca: {product.brand}</Text>
        </View>
      )}

      {error && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#ffebee' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}
```

## 6. Teste com Insomnia

1. Abrir Insomnia
2. Criar nova requisição WebSocket
3. URL: `ws://localhost:3001/scanner?deviceId=insomnia-test&type=mobile`
4. Conectar
5. Enviar:

```json
{
  "event": "scan",
  "data": {
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }
}
```

## 7. Teste com Python

```python
import socketio
import json
from datetime import datetime

sio = socketio.Client()

@sio.event
def connect():
    print('✓ Conectado ao orquestrador!')
    # Enviar um scan
    sio.emit('scan', {
        'barcode': '7896259410133',
        'timestamp': datetime.now().isoformat()
    })

@sio.event
def scan_result(data):
    print('✓ Resultado recebido:')
    print(json.dumps(data, indent=2))
    sio.disconnect()

@sio.event
def disconnect():
    print('Desconectado')

try:
    # Conectar ao ORQUESTRADOR (porta 3001)
    sio.connect(
        'http://localhost:3001/scanner',
        auth={'deviceId': 'python-test', 'type': 'mobile'},
        transports=['websocket']
    )
    sio.wait()
except Exception as e:
    print(f'✗ Erro: {e}')
```

Executar:
```bash
pip install python-socketio python-engineio
python test_scanner.py
```

## 📝 Teste HTTP Direto (Debug Only)

Para testar o Business Service diretamente (sem passar pelo orquestrador):

```bash
curl -X POST http://localhost:3002/scanner/process \
  -H "Content-Type: application/json" \
  -d '{
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T10:30:00.000Z"
  }'
```

**Nota**: Em produção, sempre use o orquestrador (porta 3001).

## Checklist de Teste

- [ ] Serviço business está rodando na porta 3002
- [ ] Orquestrador está rodando na porta 3001
- [ ] Banco de dados tem produtos com barcode
- [ ] Conexão WebSocket ao orquestrador estabelecida
- [ ] Scan enviado com sucesso
- [ ] Resultado recebido
- [ ] Produto encontrado ou erro apropriado
- [ ] Dashboard recebe notificação
- [ ] Cache funciona (segundo scan é mais rápido)
- [ ] Desconexão tratada corretamente

## Troubleshooting

### Erro: "Cannot find module 'socket.io'"
```bash
npm install socket.io
```

### Erro: "Connection refused"
- Verifique se o orquestrador está rodando na porta 3001
- Verifique se o business está rodando na porta 3002
- Verifique firewall

### Erro: "Produto não encontrado"
- Verifique se o barcode existe no banco
- Confirme o campo `barcode` na tabela `inventory_items`
- Verifique se o produto está ativo (`isActive = true`)

### Conexão cai após alguns segundos
- Verifique logs do orquestrador
- Confirme CORS está configurado corretamente
- Verifique timeout do servidor

### Erro: "Serviço indisponível"
- Verifique se o business service está respondendo
- Verifique logs do business
- Verifique variável de ambiente `BUSINESS_SERVICE_URL` no orquestrador
