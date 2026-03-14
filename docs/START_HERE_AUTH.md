# 🚀 COMECE AQUI: Erro 401 - Missing Authorization Header

## O Problema

O monolith está rejeitando requisições do orchestrador com erro `401 - Missing authorization header`.

## A Solução (3 Passos)

### 1️⃣ Iniciar os Serviços

Abra 3 terminais diferentes:

**Terminal 1 - Auth Service:**
```bash
cd services/auth
npm run start
```

**Terminal 2 - Monolith:**
```bash
cd services/monolith
npm run start
```

**Terminal 3 - Orchestrador:**
```bash
cd services/orchestrator
npm run start
```

### 2️⃣ Fazer Login

```bash
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Copie o `accessToken` da resposta.**

### 3️⃣ Testar

```bash
# Substitua <TOKEN> pelo token copiado

# Testar no Monolith
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"

# Testar no Orchestrador
curl -X GET http://localhost:3002/api/business/establishments \
  -H "Authorization: Bearer <TOKEN>"
```

## ✅ Se Funcionou

Parabéns! A autenticação está funcionando. Você pode:

1. Testar com dados reais
2. Testar com diferentes tipos de usuários
3. Testar com permissões diferentes

## ❌ Se Não Funcionou

### Erro: Connection refused

**Causa**: Serviço não está rodando

**Solução**: Verifique se o serviço foi iniciado corretamente

### Erro: Invalid credentials

**Causa**: Email ou senha incorretos

**Solução**: Verifique as credenciais ou crie um novo usuário

### Erro: Missing authorization header

**Causa**: Token não está sendo enviado

**Solução**: Verifique se o header `Authorization: Bearer <token>` está sendo enviado

### Erro: Invalid token

**Causa**: Token expirou ou JWT_SECRET é diferente

**Solução**: Faça login novamente ou verifique JWT_SECRET

## 📚 Documentação

Se você quer entender mais:

- **Rápido (5 min)**: `docs/AUTH_QUICK_FIX.md`
- **Intermediário (15 min)**: `docs/AUTH_ISSUE_SUMMARY.md`
- **Detalhado (30 min)**: `docs/AUTH_TROUBLESHOOTING_VISUAL.md`
- **Completo (45 min)**: `docs/AUTH_COMMUNICATION_FLOW.md`

## 🔧 Scripts de Teste

Se preferir usar um script:

**Windows:**
```powershell
.\scripts\test-auth-flow.ps1
```

**Linux/Mac:**
```bash
bash scripts/test-auth-flow.sh
```

## 📋 Checklist Rápido

- [ ] Auth Service rodando em 3010
- [ ] Monolith rodando em 3000
- [ ] Orchestrador rodando em 3002
- [ ] Conseguiu fazer login
- [ ] Token foi copiado
- [ ] Teste no Monolith funcionou
- [ ] Teste no Orchestrador funcionou

## 🎯 Próximos Passos

1. Siga os 3 passos acima
2. Se funcionar, testar com dados reais
3. Se não funcionar, consultar documentação mais detalhada

---

**Precisa de ajuda?** Consulte `docs/AUTH_DOCS_INDEX.md` para ver toda a documentação disponível.
