# Scanner Integration - Solução para Teste no PieHost

## ❌ Problema

```
Connection failed: ws://localhost:3009/scanner
```

O PieHost está em um servidor remoto e não consegue acessar `localhost:3009` (sua máquina local).

## ✅ Soluções

### Solução 1: Usar ngrok (Recomendado para Testes)

**ngrok** cria um túnel público para sua máquina local.

#### Passo 1: Instalar ngrok

```bash
# macOS
brew install ngrok

# Linux
curl https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip -o ngrok.zip
unzip ngrok.zip
sudo mv ngrok /usr/local/bin
```

#### Passo 2: Iniciar ngrok

```bash
ngrok http 3009
```

Você verá algo como:
```
Forwarding                    https://abc123.ngrok.io -> http://localhost:3009
```

#### Passo 3: Usar a URL do ngrok no PieHost

```
wss://abc123.ngrok.io/scanner?type=pdv&userId=test-user-123
```

**Nota**: Use `wss://` (WebSocket Secure) em vez de `ws://`

#### Passo 4: Testar

1. Abra https://piehost.com/websocket-tester
2. Cole a URL do ngrok
3. Clique "Connect"
4. Envie o scan

### Solução 2: Expor Publicamente (Produção)

Se você tem um servidor público, configure:

```
wss://seu-dominio.com/scanner?type=pdv&userId=test-user-123
```

**Requisitos:**
- Domínio próprio
- SSL/TLS (HTTPS/WSS)
- Firewall aberto na porta 3009

### Solução 3: Testar Localmente (Sem PieHost)

Use o Node.js para testar localmente:

```bash
node test-scanner.js
```

Isso funciona porque está na mesma máquina.

## 🔧 Configuração CORS Atualizada

O ScannerGateway foi atualizado com CORS habilitado:

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/scanner',
  transports: ['websocket', 'polling'],
})
```

## 📋 Passo a Passo com ngrok

### Terminal 1: Iniciar Orquestrador

```bash
cd services/orchestrator
npm run start:dev
```

### Terminal 2: Iniciar Business

```bash
cd services/business
npm run start:dev
```

### Terminal 3: Iniciar ngrok

```bash
ngrok http 3009
```

Copie a URL (ex: `https://abc123.ngrok.io`)

### Terminal 4: Testar no PieHost

1. Abra https://piehost.com/websocket-tester
2. URL: `wss://abc123.ngrok.io/scanner?type=pdv&userId=test-user-123`
3. Clique "Connect"
4. Envie: `{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T23:47:21.402Z"}}`
5. Clique "Send"

## ✅ Resposta Esperada

```json
{
  "success": false,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T23:47:21.402Z",
  "product": null
}
```

## 🔍 Troubleshooting

### Erro: "Connection refused"
- Verifique se ngrok está rodando
- Verifique se a URL do ngrok está correta
- Verifique se o Orquestrador está rodando

### Erro: "WebSocket is closed"
- ngrok pode ter expirado (sessão de 2 horas)
- Reinicie ngrok: `ngrok http 3009`

### Erro: "CORS error"
- CORS foi habilitado no ScannerGateway
- Reinicie o Orquestrador

### Nenhuma resposta
- Verifique os logs do Orquestrador
- Verifique se o Business está rodando
- Verifique a conexão com o banco de dados

## 💡 Dicas

1. **ngrok é temporário**: Use apenas para testes. Para produção, use um servidor público.

2. **URL muda**: Cada vez que você reinicia ngrok, a URL muda. Copie a nova URL.

3. **Sessão de 2 horas**: ngrok gratuito tem limite de 2 horas. Reinicie se necessário.

4. **Monitore os logs**: Abra 3 terminais para ver os logs de cada serviço.

5. **Teste localmente primeiro**: Use `node test-scanner.js` antes de testar no PieHost.

## 📊 Comparação de Métodos

| Método | Vantagem | Desvantagem |
|--------|----------|------------|
| **Localhost** | Simples, rápido | Não funciona remotamente |
| **ngrok** | Funciona remotamente, fácil | Temporário, URL muda |
| **Servidor Público** | Permanente, profissional | Requer infraestrutura |

## 🎯 Recomendação

Para **testes rápidos**: Use ngrok
Para **produção**: Use servidor público com HTTPS/WSS

## ✅ Checklist

- [ ] ngrok instalado
- [ ] ngrok rodando: `ngrok http 3009`
- [ ] Orquestrador rodando
- [ ] Business rodando
- [ ] URL do ngrok copiada
- [ ] PieHost acessível
- [ ] Conectado com sucesso
- [ ] Scan enviado
- [ ] Resposta recebida

---

**Status**: ✅ Solução Implementada
**Próximo**: Usar ngrok para testar no PieHost
