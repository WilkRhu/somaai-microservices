# Índice: Debugging de Autenticação

## Problema

O monolith está retornando `401 - Missing authorization header` quando o orchestrador tenta fazer requisições.

## Documentação por Nível de Detalhe

### 🚀 Rápido (5 minutos)

**Comece aqui se você quer resolver rápido:**

1. `docs/AUTH_QUICK_FIX.md` - Solução em 3 passos
2. `scripts/test-auth-flow.ps1` ou `scripts/test-auth-flow.sh` - Script de teste

### 📊 Intermediário (15 minutos)

**Comece aqui se você quer entender o problema:**

1. `docs/AUTH_ISSUE_SUMMARY.md` - Resumo do problema
2. `docs/QUICK_START_AUTH_DEBUG.md` - Quick start com instruções
3. `docs/AUTH_TROUBLESHOOTING_VISUAL.md` - Guia visual com árvore de decisão

### 🔍 Detalhado (30+ minutos)

**Comece aqui se você quer entender tudo:**

1. `docs/AUTH_COMMUNICATION_FLOW.md` - Fluxo completo de autenticação
2. `docs/AUTH_HEADER_FIX.md` - Solução detalhada com explicações
3. Código-fonte:
   - `services/orchestrator/src/business/business.controller.ts`
   - `services/orchestrator/src/business/business.service.ts`
   - `services/monolith/src/common/guards/auth.guard.ts`
   - `services/monolith/src/common/services/auth-validation.service.ts`
   - `services/auth/src/auth/auth.controller.ts`
   - `services/auth/src/auth/guards/jwt.guard.ts`

## Fluxo de Autenticação

```
Frontend (com token)
    ↓
Orchestrador (porta 3002)
    ├─ AuthGuard: Valida header
    ├─ BusinessController: Extrai token
    └─ BusinessService: Faz proxy com token
    ↓
Monolith (porta 3000)
    ├─ AuthGuard: Valida header
    └─ AuthValidationService: Valida com Auth Service
    ↓
Auth Service (porta 3010)
    ├─ JwtAuthGuard: Valida JWT
    └─ AuthController: Retorna validação
```

## Checklist Rápido

- [ ] Auth Service rodando em 3010
- [ ] Monolith rodando em 3000
- [ ] Orchestrador rodando em 3002
- [ ] JWT_SECRET igual em todos os serviços
- [ ] Conseguiu fazer login
- [ ] Token está sendo enviado no header Authorization
- [ ] Formato do header é: `Authorization: Bearer <token>`

## Possíveis Causas

| Causa | Sintoma | Solução |
|-------|---------|---------|
| Serviço não rodando | Connection refused | Iniciar o serviço |
| Token não sendo passado | Missing authorization header | Verificar se header está sendo enviado |
| Token expirado | Invalid token | Fazer login novamente |
| JWT_SECRET diferente | Invalid token | Usar o mesmo JWT_SECRET |
| Auth Service não respondendo | Timeout | Verificar se Auth Service está rodando |
| Banco de dados não acessível | Database error | Verificar conexão com banco de dados |

## Arquivos Modificados

- `services/orchestrator/src/business/business.controller.ts` - Adicionado logger para debug

## Scripts Criados

- `scripts/test-auth-flow.ps1` - Script de teste para Windows
- `scripts/test-auth-flow.sh` - Script de teste para Linux/Mac

## Documentação Criada

- `docs/AUTH_QUICK_FIX.md` - Solução rápida
- `docs/AUTH_ISSUE_SUMMARY.md` - Resumo do problema
- `docs/AUTH_HEADER_FIX.md` - Solução detalhada
- `docs/QUICK_START_AUTH_DEBUG.md` - Quick start
- `docs/AUTH_TROUBLESHOOTING_VISUAL.md` - Guia visual
- `docs/AUTH_DEBUGGING_INDEX.md` - Este arquivo

## Próximos Passos

1. Escolha o nível de detalhe que você quer (Rápido, Intermediário ou Detalhado)
2. Siga as instruções
3. Execute o script de teste
4. Se funcionar, testar com dados reais
5. Se não funcionar, consultar a documentação mais detalhada

## Referências

- Fluxo de autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Rotas do backend: `docs/BACKEND_ROUTES.md`
- Arquitetura: `docs/ARCHITECTURE.md`

## Suporte

Se você ainda tiver problemas:

1. Verifique os logs de cada serviço
2. Verifique a conectividade entre serviços
3. Verifique se o banco de dados está acessível
4. Consulte a documentação detalhada
5. Verifique o código-fonte dos serviços
