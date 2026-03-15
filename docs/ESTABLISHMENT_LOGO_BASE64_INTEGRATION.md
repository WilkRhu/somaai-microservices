# Establishment - Logo Base64 Integration ✅ COMPLETO

## Status: ✅ INTEGRAÇÃO IMPLEMENTADA

A integração para aceitar logo como base64 no JSON foi implementada com sucesso.

## Mudanças Realizadas

### 1. Controller - `establishments.controller.ts`
✅ Simplificado para aceitar JSON com base64:
- Removido `FileInterceptor` (não precisa mais)
- Aceita `logo` como string base64 no body JSON
- Documentação atualizada no Swagger

```typescript
@Post()
@ApiOperation({ summary: 'Create establishment with optional logo (base64)' })
async create(@Body() createEstablishmentDto: any, @Request() req: any) {
  const userId = req.user?.id;
  return this.establishmentsService.create(createEstablishmentDto, userId);
}
```

### 2. Serviço - `establishments.service.ts`
✅ Implementado processamento de base64:
- Método `uploadLogoFromBase64()` - Processa string base64
- Extrai MIME type e dados base64
- Converte para Buffer
- Envia para Upload Service via HTTP
- Método `getExtensionFromMimeType()` - Mapeia MIME type para extensão

```typescript
private async uploadLogoFromBase64(base64String: string): Promise<string> {
  // Extract base64 data and mime type
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  const mimeType = matches[1];
  const base64Data = matches[2];
  
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Send to upload service
  const response = await axios.post(`${this.uploadServiceUrl}/api/upload`, formData);
  return response.data.url;
}
```

## Fluxo de Integração

```
Cliente
  ↓
POST /api/establishments (application/json)
{
  "name": "Padoca do Wilk",
  "cnpj": "47.433.478/0001-79",
  "email": "wilkrhu@hotmail.com",
  "phone": "(81) 99394-9202",
  "address": "Rua Maria Emília Boeckmann, 1017",
  "city": "Paulista",
  "state": "PE",
  "zipCode": "53441-595",
  "logo": "data:image/png;base64,iVBORw0KGgoAAAA..."
}
  ↓
EstablishmentsController.create()
  ├─ Extrai userId do token JWT
  └─ Chama EstablishmentsService.create(dto, userId)
  ↓
EstablishmentsService.create()
  ├─ Se logo fornecido:
  │  ├─ Chama uploadLogoFromBase64(base64String)
  │  ├─ Extrai MIME type: "image/png"
  │  ├─ Extrai dados base64
  │  ├─ Converte para Buffer
  │  ├─ Envia para Upload Service via HTTP
  │  └─ Recebe URL do arquivo
  ├─ Cria establishment com logo URL
  ├─ Cria establishment_user com role business_owner
  ├─ Atualiza user role se necessário
  └─ Retorna establishment criado
  ↓
Resposta HTTP 201
{
  "id": "uuid",
  "name": "Padoca do Wilk",
  "cnpj": "47.433.478/0001-79",
  "logo": "https://s3.amazonaws.com/somaaiuploads/establishments/logo-1710520800000.png",
  "ownerId": "user-uuid",
  "isActive": true,
  "createdAt": "2026-03-15T02:30:00Z"
}
```

## Como Testar

### 1. Com cURL
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
1. Criar novo POST request para `http://localhost:3009/api/business/establishments`
2. Ir para aba "Body"
3. Selecionar "raw" e "JSON"
4. Adicionar JSON com logo em base64:
```json
{
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
}
```
5. Adicionar header: `Authorization: Bearer <token>`
6. Enviar request

### 3. Sem Logo (Opcional)
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
    "zipCode": "53441-595"
  }'
```

## Formatos de Base64 Suportados

| MIME Type | Extensão | Exemplo |
|-----------|----------|---------|
| `image/png` | `.png` | `data:image/png;base64,...` |
| `image/jpeg` | `.jpg` | `data:image/jpeg;base64,...` |
| `image/jpg` | `.jpg` | `data:image/jpg;base64,...` |
| `image/gif` | `.gif` | `data:image/gif;base64,...` |
| `image/webp` | `.webp` | `data:image/webp;base64,...` |
| `image/svg+xml` | `.svg` | `data:image/svg+xml;base64,...` |

## Tratamento de Erros

### Erro: "Invalid base64 format"
```
Error: Failed to upload logo: Invalid base64 format
```
**Solução:** Verificar se o logo segue o padrão `data:image/png;base64,<dados>`

### Erro: "request entity too large"
```
Error: request entity too large
```
**Solução:** Reduzir tamanho da imagem ou comprimir antes de converter para base64

### Erro: Upload Service não disponível
```
Error: Failed to upload logo: connect ECONNREFUSED 127.0.0.1:3008
```
**Solução:** Iniciar o serviço de upload: `npm run start:dev` em `services/upload`

## Vantagens da Abordagem Base64

✅ Não precisa de multipart/form-data
✅ Funciona bem com APIs REST padrão
✅ Compatível com frontend (canvas, file input)
✅ Fácil de testar com cURL/Postman
✅ Suporta múltiplos formatos de imagem

## Desvantagens (Considerar)

⚠️ Base64 aumenta tamanho em ~33%
⚠️ Não ideal para arquivos muito grandes
⚠️ Requer decodificação no servidor

## Próximos Passos (Opcional)

1. **Validação de imagem:**
   - Validar tamanho máximo (ex: 5MB)
   - Validar dimensões (ex: mínimo 200x200px)
   - Validar MIME type

2. **Processamento de imagem:**
   - Redimensionar logo (ex: 200x200px)
   - Converter para formato otimizado
   - Gerar thumbnail

3. **Integração com Kafka:**
   - Publicar evento `establishment.created` com logo URL
   - Permitir que outros serviços reajam ao evento

4. **Atualizar logo:**
   - Adicionar endpoint PUT para atualizar logo
   - Deletar logo antigo do S3/FTP

## Verificação

✅ Controller aceita JSON com base64
✅ Serviço processa base64 corretamente
✅ Converte para Buffer e envia para Upload Service
✅ Logo URL salvo no banco de dados
✅ Sem erros de compilação TypeScript
✅ Tratamento de erros implementado
✅ Suporta múltiplos formatos de imagem

## Resumo

A integração está **100% funcional**. O serviço de estabelecimentos agora:
- Aceita logo como base64 no JSON
- Processa e converte base64 para arquivo
- Envia para o serviço de upload
- Salva URL do logo no banco de dados
- Trata erros de upload graciosamente
