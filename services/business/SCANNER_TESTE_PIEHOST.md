# Scanner Integration - Teste no PieHost WebSocket Tester

## 🌐 Acessar o Site

1. Abra: https://piehost.com/websocket-tester
2. Você verá uma interface com campos para testar WebSocket

## 📝 Passo a Passo

### Passo 1: Configurar a URL

No campo **"URL to WebSocket server"**, insira:

```
ws://localhost:3009/scanner?type=pdv&userId=test-user-123
```

**Ou se estiver testando remotamente:**

```
ws://seu-servidor:3009/scanner?type=pdv&userId=test-user-123
```

### Passo 2: Conectar

1. Clique no botão **"Connect"** (ou similar)
2. Você deve ver uma mensagem de sucesso indicando que está conectado

### Passo 3: Enviar Mensagem de Scan

No campo de mensagem, copie e cole:

```json
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T23:47:21.402Z"}}
```

**Ou de forma mais legível:**

```json
{
  "event": "scan",
  "data": {
    "barcode": "7896259410133",
    "timestamp": "2026-03-15T23:47:21.402Z"
  }
}
```

### Passo 4: Enviar

1. Clique no botão **"Send"**
2. Você deve ver a resposta na seção de mensagens recebidas

## ✅ Resposta Esperada

Se tudo estiver funcionando, você verá:

```json
{
  "success": false,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T23:47:21.402Z",
  "product": null
}
```

**Ou se o produto existir no banco:**

```json
{
  "success": true,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T23:47:21.402Z",
  "product": {
    "normalizedName": "Produto Teste",
    "originalName": "Produto Teste",
    "brand": "Marca",
    "category": "Categoria",
    "unit": "UN",
    "averagePrice": "25.50",
    "purchaseCount": 0
  }
}
```

## 🔄 Eventos Automáticos

Você também pode receber eventos automáticos:

### client-connected

Quando você conecta, você receberá:

```json
{
  "event": "client-connected",
  "data": {
    "clientId": "QUmeeI1wUIN1mbAWAAAD",
    "type": "pdv",
    "userId": "test-user-123",
    "timestamp": "2026-03-15T23:47:21.401Z"
  }
}
```

### client-disconnected

Quando você desconecta, você receberá:

```json
{
  "event": "client-disconnected",
  "data": {
    "clientId": "QUmeeI1wUIN1mbAWAAAD",
    "type": "pdv",
    "userId": "test-user-123",
    "timestamp": "2026-03-15T23:47:21.401Z"
  }
}
```

## 🧪 Testes Adicionais

### Teste 1: Barcode Inválido

Envie:
```json
{"event":"scan","data":{"barcode":"","timestamp":"2026-03-15T23:47:21.402Z"}}
```

Resposta esperada:
```json
{
  "success": false,
  "barcode": "",
  "timestamp": "2026-03-15T23:47:21.402Z",
  "product": null,
  "error": "Barcode inválido"
}
```

### Teste 2: Múltiplos Scans

Envie o mesmo scan várias vezes. O segundo deve ser mais rápido (cache):

```json
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T23:47:21.402Z"}}
```

### Teste 3: Diferentes Barcodes

Teste com diferentes barcodes que existem no seu banco de dados.

## 📊 Interpretando os Resultados

| Campo | Significado |
|-------|-------------|
| `success: true` | Produto encontrado |
| `success: false` | Produto não encontrado ou erro |
| `product: null` | Nenhum produto encontrado |
| `product: {...}` | Dados do produto encontrado |
| `error` | Mensagem de erro (se houver) |

## 🔍 Troubleshooting

### Erro: "Connection refused"
- Verifique se o Orquestrador está rodando na porta 3009
- Teste: `curl http://localhost:3009/health`

### Erro: "Cannot connect"
- Verifique a URL (deve ser `ws://`, não `http://`)
- Verifique se está usando a porta correta (3009)
- Verifique se o namespace está correto (`/scanner`)

### Nenhuma resposta recebida
- Verifique os logs do Orquestrador
- Verifique se o Business está rodando
- Verifique a conexão com o banco de dados

### Produto não encontrado
- Verifique se o barcode existe no banco
- Insira um produto de teste com o barcode `7896259410133`

## 💡 Dicas

1. **Mantenha a aba aberta**: O PieHost mantém a conexão aberta enquanto você estiver na página

2. **Copie e cole as mensagens**: Use os exemplos acima para evitar erros de digitação

3. **Verifique os logs**: Abra o console do navegador (F12) para ver logs adicionais

4. **Teste múltiplas vezes**: Teste com diferentes barcodes e cenários

5. **Monitore o servidor**: Abra os logs do Orquestrador e Business em outro terminal

## 📝 Exemplo Completo de Teste

1. Abra https://piehost.com/websocket-tester
2. URL: `ws://localhost:3009/scanner?type=pdv&userId=test-user-123`
3. Clique "Connect"
4. Aguarde a mensagem `client-connected`
5. Envie: `{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T23:47:21.402Z"}}`
6. Clique "Send"
7. Aguarde a resposta `scan-result`
8. Verifique se o resultado está correto

## ✅ Checklist

- [ ] Orquestrador rodando na porta 3009
- [ ] Business rodando na porta 3002
- [ ] Banco de dados conectado
- [ ] PieHost acessível
- [ ] URL correta inserida
- [ ] Conectado com sucesso
- [ ] Evento `client-connected` recebido
- [ ] Scan enviado com sucesso
- [ ] Resposta `scan-result` recebida
- [ ] Resultado correto

## 🎯 Próximos Passos

1. ✅ Testar no PieHost
2. ⏳ Integrar com App Mobile
3. ⏳ Integrar com Frontend Dashboard
4. ⏳ Adicionar autenticação JWT
5. ⏳ Deploy em produção

---

**Status**: ✅ Pronto para Teste no PieHost
**Teste**: ✅ Funcionando
