# Body Size Limit Fix - "Request Entity Too Large" ✅ RESOLVIDO

## Problema
Erro ao enviar estabelecimento com logo em base64 através do orquestrador:
```
[Nest] 24100  - 14/03/2026, 23:40:35   ERROR [ExceptionsHandler] request entity too large
```

## Causa
O NestJS/Express tem um limite padrão de tamanho de body (100KB). Como base64 aumenta o tamanho em ~33%, imagens maiores causam esse erro.

O erro ocorria em **dois lugares**:
1. ❌ Business Service (já corrigido)
2. ❌ Orchestrator Service (agora corrigido)

## Solução
Aumentar o limite de tamanho do body parser em ambos os serviços.

## Mudanças Realizadas

### 1. Business Service - `services/business/src/main.ts`
✅ Adicionado middleware de body parser com limite de 50MB

### 2. Orchestrator Service - `services/orchestrator/src/main.ts`
✅ Adicionado middleware de body parser com limite de 50MB

```typescript
// Increase body size limit for base64 images
app.use(require('express').json({ limit: '50mb' }));
app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
```

## Fluxo Corrigido

```
Cliente
  ↓
POST /api/business/establishments (50MB limit)
  ├─ Orquestrador recebe (50MB limit) ✅
  └─ Repassa para Business Service (50MB limit) ✅
  ↓
Business Service
  ├─ Processa base64
  ├─ Envia para Upload Service
  └─ Retorna URL do logo
  ↓
Resposta HTTP 201 ✅
```

## Como Testar

### 1. Reiniciar os serviços
```bash
# Terminal 1 - Business Service
cd services/business
npm run start:dev

# Terminal 2 - Orchestrator
cd services/orchestrator
npm run start:dev
```

### 2. Enviar request com logo
```bash
curl -X POST http://localhost:3009/api/business/establishments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Padoca do Wilk",
    "cnpj": "47.433.478/0001-79",
    "type": "Padaria",
    "phone": "(81) 99394-9202",
    "email": "wilkrhu@hotmail.com",
    "address": "Rua Maria Emília Boeckmann, 1017",
    "city": "Paulista",
    "state": "PE",
    "zipCode": "53441-595",
    "description": "Padaria artesanal",
    "latitude": -7.940787842769113,
    "longitude": -34.8647693976013,
    "logo": "data:image/png;base64,iVBORw0KGgoAAAAAAAA..."
  }'
```

## Limites Configurados

| Serviço | Limite | Arquivo |
|---------|--------|---------|
| Business | 50MB | `services/business/src/main.ts` |
| Orchestrator | 50MB | `services/orchestrator/src/main.ts` |

## Verificação

✅ Limite de body aumentado para 50MB em ambos os serviços
✅ Suporta base64 de imagens grandes
✅ Sem erros de compilação
✅ Pronto para produção

## Próximos Passos (Opcional)

1. **Validar tamanho de imagem no serviço:**
   ```typescript
   if (createEstablishmentDto.logo) {
     const base64Size = createEstablishmentDto.logo.length;
     if (base64Size > 5 * 1024 * 1024) { // 5MB
       throw new Error('Image too large');
     }
   }
   ```

2. **Configurar limite por ambiente:**
   ```typescript
   const limit = process.env.BODY_SIZE_LIMIT || '50mb';
   app.use(require('express').json({ limit }));
   ```

3. **Adicionar compressão:**
   ```typescript
   app.use(require('compression')());
   ```

## Resumo

O erro foi resolvido aumentando o limite de tamanho do body parser para 50MB em **ambos os serviços** (Business e Orchestrator). Agora é possível enviar estabelecimentos com logos em base64 sem problemas.
