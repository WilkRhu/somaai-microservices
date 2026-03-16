# Scanner Integration - Debug para PieHost

## ✅ Correção Aplicada

O problema era que o código estava esperando `deviceId` mas agora usamos `userId`.

**Corrigido em**: `services/orchestrator/src/business/scanner.gateway.ts`

## 🧪 Teste Local Validado

```
✓ Conectado ao scanner!
✓ Evento client-connected recebido com userId
✓ Resultado recebido
```

## 🌐 Agora Testar no PieHost com ngrok

### Passo 1: Iniciar ngrok

```bash
ngrok http 3009
```

Copie a URL (ex: `https://abc123.ngrok.io`)

### Passo 2: No PieHost

**URL:**
```
wss://abc123.ngrok.io/scanner?type=pdv&userId=test-user-123
```

**Mensagem:**
```json
{"event":"scan","data":{"barcode":"7896259410133","timestamp":"2026-03-15T23:53:42.432Z"}}
```

### Passo 3: Resposta Esperada

```json
{
  "success": false,
  "barcode": "7896259410133",
  "timestamp": "2026-03-15T23:53:42.432Z",
  "product": null
}
```

## 🔍 Se Ainda Não Funcionar

### Verificar Logs do Orquestrador

```bash
# Terminal rodando o Orquestrador
# Você deve ver:
[ScannerGateway] Cliente conectado: umrK109vDzSGbnkIAAAB (pdv - test-user-123)
[ScannerGateway] Scan recebido de test-user-123: 7896259410133
[ScannerGateway] Scan processado: 7896259410133 - Produto não encontrado
```

### Verificar Logs do Business

```bash
# Terminal rodando o Business
# Você deve ver:
[ScannerController] POST /scanner/process
[ScannerService] Processando scan: 7896259410133
```

### Verificar Console do Navegador (F12)

No PieHost, abra o console (F12) e procure por:
- Erros de conexão
- Erros de CORS
- Mensagens de WebSocket

## 📋 Checklist de Debug

- [ ] ngrok rodando
- [ ] URL do ngrok copiada corretamente
- [ ] Usando `wss://` (não `ws://`)
- [ ] Query parameters corretos: `type=pdv&userId=test-user-123`
- [ ] Orquestrador rodando
- [ ] Business rodando
- [ ] Banco de dados conectado
- [ ] Logs do Orquestrador mostram conexão
- [ ] Logs do Business mostram requisição
- [ ] Resposta recebida no PieHost

## 🚨 Erros Comuns

### "Connection failed"
- ngrok não está rodando
- URL do ngrok está incorreta
- Orquestrador não está rodando

### "WebSocket is closed"
- ngrok expirou (sessão de 2 horas)
- Reinicie ngrok

### "CORS error"
- CORS foi habilitado, deve funcionar
- Tente recarregar a página

### "Nenhuma resposta"
- Business não está rodando
- Banco de dados não está conectado
- Verifique os logs

## 💡 Dicas Importantes

1. **Use `wss://` não `ws://`**: ngrok usa HTTPS, então WebSocket deve ser WSS

2. **Copie a URL corretamente**: Cada vez que reinicia ngrok, a URL muda

3. **Monitore os logs**: Abra 3 terminais para ver o que está acontecendo

4. **Teste localmente primeiro**: `node test-scanner.js` deve funcionar

5. **Reinicie tudo se necessário**: Às vezes ajuda reiniciar os serviços

## ✅ Confirmação

O código foi corrigido e testado localmente. Se funcionar no PieHost, funciona no seu front!

---

**Status**: ✅ Código Corrigido
**Teste Local**: ✅ Funcionando
**Próximo**: Testar no PieHost com ngrok
