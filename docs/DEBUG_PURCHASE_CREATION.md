# Debug: Purchases Não Estão Sendo Salvas

## Problema
As purchases estão sendo criadas (logs mostram sucesso), mas não aparecem no banco de dados quando consultadas.

## Possíveis Causas

### 1. **Transação Não Commitada**
- O NestJS/TypeORM pode estar em uma transação que não foi commitada
- Solução: Verificar se há `@Transaction()` decorator sem commit

### 2. **Banco de Dados Errado**
- Pode estar salvando em outro banco de dados
- Solução: Verificar `DB_DATABASE` no `.env`

### 3. **Sincronização de Banco**
- TypeORM `synchronize: true` pode estar criando tabelas diferentes
- Solução: Verificar schema das tabelas

### 4. **Erro Silencioso**
- Erro na validação de dados que não está sendo logado
- Solução: Adicionar try/catch com logs detalhados

### 5. **Orchestrator Falhando**
- O `createPurchase` tenta chamar orchestrator primeiro
- Se falhar, faz fallback para salvar direto
- Mas ambos podem estar falhando silenciosamente

## Como Debugar

### Passo 1: Verificar Dados no Banco

```bash
# PowerShell
.\scripts\check-monolith-data.ps1

# Bash
bash scripts/check-monolith-data.sh

# Ou manualmente no MySQL
mysql -h localhost -u somaai -p somaai_password somaai_monolith
SELECT * FROM users;
SELECT * FROM purchases;
SELECT * FROM purchase_items;
```

### Passo 2: Verificar Logs do Monolith

Procure por:
```
📝 [CREATE PURCHASE] Starting purchase creation
💾 [CREATE PURCHASE] Saving purchase to database...
✅ [CREATE PURCHASE] Purchase saved with ID
```

Se não vir esses logs, o método não está sendo chamado.

### Passo 3: Verificar Logs do Orchestrator

Se o monolith está chamando o orchestrator:
```
🔄 [CREATE PURCHASE] Calling orchestrator service...
⚠️ [CREATE PURCHASE] Orchestrator call failed
```

### Passo 4: Verificar Validação de Dados

Adicione logs para verificar se os dados estão corretos:

```typescript
this.logger.log(`📝 Purchase data:`, JSON.stringify(purchaseDto, null, 2));
```

### Passo 5: Verificar Conexão com Banco

```sql
-- Verificar se as tabelas existem
SHOW TABLES FROM somaai_monolith;

-- Verificar schema da tabela purchases
DESCRIBE somaai_monolith.purchases;

-- Verificar se há dados
SELECT COUNT(*) FROM somaai_monolith.purchases;
```

## Checklist de Verificação

- [ ] Monolith está rodando na porta 3000
- [ ] Banco de dados está rodando na porta 3306
- [ ] `.env` do monolith tem `DB_DATABASE=somaai_monolith`
- [ ] Usuário foi sincronizado para o monolith
- [ ] Logs mostram "Purchase saved with ID"
- [ ] Query `SELECT * FROM purchases` retorna dados
- [ ] Orchestrator está rodando (se usando integração)

## Logs Esperados

### Sucesso Completo
```
📝 [CREATE PURCHASE] Starting purchase creation for user: f0cab758-0d6c-4820-9816-fc29bd5cec8f
   - Merchant: Supermercado XYZ
   - Amount: 150.50
   - Type: PURCHASE
   - Payment Method: credit_card

🔍 [CREATE PURCHASE] Ensuring user exists in monolith...
✅ [CREATE PURCHASE] User verified in monolith

🔄 [CREATE PURCHASE] Calling orchestrator service...
✅ [CREATE PURCHASE] Orchestrator response received

💾 [CREATE PURCHASE] Saving purchase to database...
✅ [CREATE PURCHASE] Purchase saved with ID: 550e8400-e29b-41d4-a716-446655440000

📦 [CREATE PURCHASE] Saving 2 purchase items...
✅ [CREATE PURCHASE] Purchase items saved

📤 [CREATE PURCHASE] Publishing Kafka event...
✅ [CREATE PURCHASE] Kafka event published

🎉 [CREATE PURCHASE] Purchase creation completed successfully
```

### Fallback (Orchestrator Falhou)
```
⚠️ [CREATE PURCHASE] Orchestrator call failed: connect ECONNREFUSED 127.0.0.1:3002
💾 [CREATE PURCHASE] Saving purchase directly to database (fallback)...
✅ [CREATE PURCHASE] Purchase saved (fallback) with ID: 550e8400-e29b-41d4-a716-446655440000
```

## Soluções Rápidas

### Se o banco está vazio:
1. Verificar se `DB_SYNCHRONIZE=true` no `.env`
2. Reiniciar o monolith para criar tabelas
3. Verificar se há erros de criação de tabelas nos logs

### Se os logs não aparecem:
1. Verificar se `LOG_LEVEL=debug` no `.env`
2. Verificar se o método `createPurchase` está sendo chamado
3. Adicionar logs no controller também

### Se o orchestrator está falhando:
1. Verificar se orchestrator está rodando: `curl http://localhost:3002/health`
2. Verificar se `ORCHESTRATOR_SERVICE_URL` está correto no `.env`
3. Verificar logs do orchestrator

## Próximos Passos

1. Execute `check-monolith-data.ps1` ou `check-monolith-data.sh`
2. Verifique os logs do monolith
3. Verifique se há dados nas tabelas
4. Se vazio, adicione mais logs no `createPurchase`
5. Se há dados, verifique por que `listPurchases` não retorna

