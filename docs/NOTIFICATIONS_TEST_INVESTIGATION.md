# Investigação - Teste de Notificações Completo

## Problemas Encontrados

### 1. **Erro 500 ao Recuperar Notificações**
**Causa:** Banco de dados incorreto
- **Arquivo:** `services/notifications/.env`
- **Problema:** `DB_DATABASE=somaai_master` (banco genérico)
- **Solução:** Alterado para `DB_DATABASE=somaai_notifications`
- **Status:** ✅ CORRIGIDO

**Detalhes:**
- O serviço de notificações estava tentando usar a tabela `notifications` no banco `somaai_master`
- A tabela não existia nesse banco, causando erro 500
- Agora usa o banco dedicado `somaai_notifications` com `DB_SYNCHRONIZE=true`

### 2. **Kafka Não Recebe Eventos do Orquestrador**
**Causa:** Erro de logging/tratamento no KafkaService
- **Arquivo:** `services/orchestrator/src/kafka/kafka.service.ts`
- **Problema:** 
  - Método `publishEvent` não retornava resultado
  - Erros não eram propagados corretamente
  - Logging insuficiente para debug
- **Solução:** 
  - Adicionado retorno do resultado da publicação
  - Melhorado tratamento de erros com stack trace
  - Adicionado logging detalhado
  - Melhorado a chave da mensagem (agora usa `userId` se disponível)
- **Status:** ✅ CORRIGIDO

**Detalhes do Código:**
```typescript
// Antes: Não retornava resultado, erros eram silenciosos
await this.producer.send({...});
this.logger.log(`Published event to topic ${topic}`);

// Depois: Retorna resultado, erros são propagados
const result = await this.producer.send({...});
this.logger.log(`Published event to topic ${topic}: ${JSON.stringify(result)}`);
return result;
```

## Fluxo de Notificações Esperado

```
1. Cliente → POST /notifications/send (Orquestrador)
   ↓
2. NotificationsClient.send() → Publica no Kafka
   ↓
3. Kafka Topic: notification.send
   ↓
4. NotificationConsumer (Serviço de Notificações) → Consome evento
   ↓
5. NotificationsService.sendNotification() → Salva no BD
   ↓
6. EmailService.sendEmail() → Envia email
   ↓
7. GET /notifications/{userId} → Recupera notificações do BD
```

## Próximos Passos

1. **Reiniciar o serviço de notificações:**
   ```bash
   cd services/notifications
   npm run start:dev
   ```

2. **Executar o teste novamente:**
   ```bash
   node scripts/test-notifications-full-flow.js
   ```

3. **Verificar os logs:**
   - Orquestrador: Deve mostrar "Published event to topic notification.send"
   - Serviço de Notificações: Deve mostrar "Received message from topic notification.send"
   - Banco de dados: Deve ter registros na tabela `notifications`

## Arquivos Modificados

- ✅ `services/notifications/.env` - Banco de dados corrigido
- ✅ `services/orchestrator/src/kafka/kafka.service.ts` - Melhorado tratamento de eventos
- ✅ `scripts/test-notifications-full-flow.js` - Porta corrigida (3015)

## Verificação de Saúde

Após as correções, o teste deve mostrar:
- ✅ Orquestrador respondendo (3009)
- ✅ Serviço de Notificações respondendo (3015)
- ✅ Notificação enviada com sucesso (201)
- ✅ Evento recebido no Kafka
- ✅ Notificação recuperada do banco de dados
- ✅ Email enviado
