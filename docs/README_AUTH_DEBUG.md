# Debugging de Autenticação - Guia Completo

## 🎯 Objetivo

Resolver o erro `401 - Missing authorization header` no monolith.

## 📍 Comece Aqui

**Novo por aqui?** Leia `docs/START_HERE_AUTH.md` (3 minutos)

## 📚 Documentação Disponível

### Rápido (5-10 min)
- `START_HERE_AUTH.md` - Comece aqui
- `AUTH_QUICK_FIX.md` - Solução em 3 passos
- `AUTH_ISSUE_SUMMARY.md` - Resumo

### Intermediário (15-20 min)
- `AUTH_VISUAL_SUMMARY.md` - Resumo visual
- `QUICK_START_AUTH_DEBUG.md` - Quick start
- `AUTH_TROUBLESHOOTING_VISUAL.md` - Guia visual

### Detalhado (30-45 min)
- `AUTH_HEADER_FIX.md` - Solução detalhada
- `AUTH_COMMUNICATION_FLOW.md` - Fluxo completo

### Referência
- `AUTH_DEBUGGING_INDEX.md` - Índice
- `AUTH_DOCS_INDEX.md` - Índice completo
- `WORK_COMPLETED.md` - Resumo do trabalho

## 🚀 Solução Rápida

```bash
# 1. Iniciar serviços (3 terminais)
cd services/auth && npm run start
cd services/monolith && npm run start
cd services/orchestrator && npm run start

# 2. Fazer login
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Copiar token e testar
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"
```

## 🔧 Scripts de Teste

- `scripts/test-auth-flow.ps1` (Windows)
- `scripts/test-auth-flow.sh` (Linux/Mac)

## ✅ Checklist

- [ ] Serviços rodando
- [ ] Login funcionando
- [ ] Token sendo enviado
- [ ] Teste no Monolith OK
- [ ] Teste no Orchestrador OK

---

**Próximo**: Leia `START_HERE_AUTH.md`
