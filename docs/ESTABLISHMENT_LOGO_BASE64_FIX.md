# Establishment - Logo Base64 - Fix "Request Entity Too Large" ✅ RESOLVIDO

## Problema
Erro ao enviar estabelecimento com logo em base64:
```
{"statusCode":413,"message":"request entity too large"}
```

## Causa
O NestJS/Express tem um limite padrão de tamanho de body (100KB). Como base64 aumenta o tamanho em ~33%, imagens maiores causam esse erro.

## Solução
Aumentar o limite de tamanho do body parser no `main.ts`:

```typescript
// Increase body size limit for base64 images
app.use(require('express').json({ limit: '50mb' }));
app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
```

## Mudanças Realizadas

### `services/business/src/main.ts`
✅ Adicionado middleware de body parser com limite de 50MB:
- `express.json({ limit: '50mb' })` - Para JSON
- `express.urlencoded({ limit: '50mb', extended: true })` - Para form-urlencoded

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limit for base64 images
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS
  app.enableCors({...});
  
  // ... resto do código
}
```

## Limites Recomendados

| Tamanho | Caso de Uso |
|---------|-----------|
| 1MB | Pequenas imagens (ícones, logos) |
| 5MB | Imagens médias (fotos de produtos) |
| 10MB | Imagens grandes (documentos) |
| 50MB | Máximo recomendado |

## Como Testar

### 1. Com cURL (agora funciona)
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

### 2. Com Postman
1. POST para `http://localhost:3009/api/business/establishments`
2. Body → raw → JSON
3. Adicionar logo em base64
4. Enviar

## Verificação

✅ Limite de body aumentado para 50MB
✅ Suporta base64 de imagens grandes
✅ Sem erros de compilação
✅ Pronto para produção

## Próximos Passos (Opcional)

1. **Validar tamanho de imagem:**
   ```typescript
   if (createEstablishmentDto.logo) {
     const base64Size = createEstablishmentDto.logo.length;
     if (base64Size > 5 * 1024 * 1024) { // 5MB
       throw new Error('Image too large');
     }
   }
   ```

2. **Comprimir imagem antes de enviar:**
   - Usar biblioteca como `sharp` ou `jimp`
   - Redimensionar para tamanho máximo
   - Converter para formato otimizado

3. **Configurar limite por ambiente:**
   ```typescript
   const limit = process.env.BODY_SIZE_LIMIT || '50mb';
   app.use(require('express').json({ limit }));
   ```

## Resumo

O erro foi resolvido aumentando o limite de tamanho do body parser para 50MB. Agora é possível enviar estabelecimentos com logos em base64 sem problemas.
