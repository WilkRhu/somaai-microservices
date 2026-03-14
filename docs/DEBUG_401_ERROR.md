# Debug: Erro 401 - Request failed with status code 401

## Problema

O orchestrador está recebendo erro `401 - Request failed with status code 401` ao tentar fazer proxy para o monolith.

```
ERROR [ExceptionsHandler] Request failed with status code 401
AxiosError: Request failed with status code 401
```

## Causas Possíveis

### 1. Token não está sendo passado corretamente

**Sintoma**: Header Authorization não está sendo enviado

**Solução**:
1. Verificar se o token está sendo extraído corretamente no orchestrador
2. Verificar se o header está sendo passado para o monolith

### 2. Token está expirado

**Sintoma**: Token foi gerado há muito tempo

**Solução**:
1. Fazer login novamente
2. Copiar novo token
3. Testar com novo token

### 3. JWT_SECRET é diferente

**Sintoma**: Token foi gerado com um JWT_SECRET diferente

**Solução**:
1. Verificar se JWT_SECRET é igual em auth service e monolith
2. Se diferente, usar o mesmo JWT_SECRET

### 4. Auth Service não está respondendo

**Sintoma**: Monolith não consegue validar o token com auth service

**Solução**:
1. Verificar se Auth Service está rodando
2. Verificar se AUTH_SERVICE_URL está correto no monolith

### 5. Usuário não existe ou está inativo

**Sintoma**: Token é válido mas usuário não existe

**Solução**:
1. Verificar se usuário existe no banco de dados
2. Verificar se usuário está ativo (isActive = true)

## Como Debugar

### 1. Verificar Logs do Orchestrador

```bash
# Procure por:
# - "Proxying POST /api/monolith/users/..."
# - "No authorization header provided"
# - "Proxy request failed"
```

### 2. Verificar Logs do Monolith

```bash
# Procure por:
# - "Auth guard error"
# - "Token validation failed"
# - "Auth service returned 401"
# - "No response from auth service"
```

### 3. Verificar Logs do Auth Service

```bash
# Procure por:
# - "Token validation failed"
# - "Invalid token"
# - "User not found"
```

### 4. Testar Manualmente

```bash
# 1. Fazer login
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Copiar token

# 3. Testar no monolith diretamente
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <TOKEN>"

# 4. Se funcionar no monolith, testar no orchestrador
curl -X GET http://localhost:3009/api/monolith/purchases \
  -H "Authorization: Bearer <TOKEN>"
```

## Checklist de Verificação

- [ ] Auth Service rodando em 3010
- [ ] Monolith rodando em 3000
- [ ] Orchestrador rodando em 3009
- [ ] JWT_SECRET igual em auth service e monolith
- [ ] AUTH_SERVICE_URL correto no monolith
- [ ] MONOLITH_SERVICE_URL correto no orchestrador
- [ ] Token foi obtido com sucesso
- [ ] Token está sendo enviado no header Authorization
- [ ] Formato do header é: `Authorization: Bearer <token>`
- [ ] Usuário existe no banco de dados
- [ ] Usuário está ativo (isActive = true)

## Melhorias Implementadas

### 1. Melhor Tratamento de Erro no MonolithService

```typescript
// Agora registra logs detalhados
this.logger.debug(`Proxying ${method} ${url}`);
this.logger.warn(`No authorization header provided`);
this.logger.error(`Proxy request failed: ${error.message}`);

// Diferencia entre tipos de erro
if (error.response) {
  // Erro da resposta HTTP
} else if (error.request) {
  // Erro na requisição (sem resposta)
} else {
  // Erro na configuração
}
```

### 2. Melhor Tratamento de Erro no AuthGuard

```typescript
// Agora registra logs detalhados
this.logger.warn('Missing authorization header');
this.logger.debug(`Validating token: ${token.substring(0, 20)}...`);
this.logger.debug(`Token validated for user: ${user.id}`);

// Preserva a mensagem de erro original
if (error instanceof HttpException) {
  throw error;
}
```

### 3. Melhor Tratamento de Erro no AuthValidationService

```typescript
// Agora registra logs detalhados
this.logger.debug(`Validating token with auth service`);
this.logger.error(`Auth service returned ${error.response.status}`);
this.logger.error(`No response from auth service`);

// Diferencia entre tipos de erro
if (error.response) {
  // Erro da resposta HTTP
} else if (error.request) {
  // Erro na requisição (sem resposta)
} else if (error instanceof HttpException) {
  // Já é uma HttpException
}
```

## Próximos Passos

1. Verificar os logs de cada serviço
2. Identificar qual serviço está retornando 401
3. Seguir o checklist de verificação
4. Testar manualmente cada etapa

## Referências

- Autenticação: `docs/AUTH_COMMUNICATION_FLOW.md`
- Proxy: `docs/MONOLITH_PROXY_SOLUTION.md`
- Teste: `docs/TEST_MONOLITH_PROXY.md`
