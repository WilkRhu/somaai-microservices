# Establishment - Upload Service Integration ✅ COMPLETO

## Status: ✅ INTEGRAÇÃO IMPLEMENTADA

A integração entre o serviço de estabelecimentos e o serviço de upload foi implementada com sucesso.

## Mudanças Realizadas

### 1. Controller - `establishments.controller.ts`
✅ Adicionado suporte a upload de arquivo:
- `@UseInterceptors(FileInterceptor('logo'))` - Intercepta arquivo
- `@ApiConsumes('multipart/form-data')` - Documenta no Swagger
- Parâmetro `@UploadedFile() file: Express.Multer.File` - Recebe arquivo

```typescript
@Post()
@UseInterceptors(FileInterceptor('logo'))
@ApiConsumes('multipart/form-data')
async create(
  @Body() createEstablishmentDto: any,
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any,
)
```

### 2. Serviço - `establishments.service.ts`
✅ Implementado upload de logo:
- Método `uploadLogo()` - Envia arquivo para serviço de upload
- Integração com axios - Chamada HTTP ao upload service
- Tratamento de erros - Validação e logging
- Salva URL do logo no banco de dados

```typescript
private async uploadLogo(file: Express.Multer.File): Promise<string> {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append('file', blob, file.originalname);
  formData.append('folder', 'establishments');

  const response = await axios.post(
    `${this.uploadServiceUrl}/api/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data.url;
}
```

### 3. Configuração - `.env`
✅ Adicionada variável de ambiente:
```
UPLOAD_SERVICE_URL=http://localhost:3008
```

### 4. Módulo - `establishments.module.ts`
✅ Módulo configurado (sem mudanças necessárias)
- FileInterceptor é fornecido pelo `@nestjs/platform-express`

## Fluxo de Integração

```
Cliente
  ↓
POST /api/establishments (multipart/form-data)
  ├─ name, cnpj, email, phone, address, etc.
  └─ logo (arquivo PNG/JPG)
  ↓
EstablishmentsController.create()
  ├─ Recebe arquivo via FileInterceptor
  └─ Chama EstablishmentsService.create(dto, userId, file)
  ↓
EstablishmentsService.create()
  ├─ Se arquivo fornecido:
  │  ├─ Chama uploadLogo(file)
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
  "name": "Meu Estabelecimento",
  "cnpj": "12.345.678/0001-90",
  "logo": "https://s3.amazonaws.com/somaaiuploads/establishments/...",
  "ownerId": "user-uuid",
  "isActive": true,
  "createdAt": "2026-03-15T02:30:00Z"
}
```

## Como Testar

### 1. Com cURL
```bash
curl -X POST http://localhost:3011/api/establishments \
  -H "Authorization: Bearer <token>" \
  -F "name=Meu Estabelecimento" \
  -F "cnpj=12.345.678/0001-90" \
  -F "email=contato@estabelecimento.com" \
  -F "phone=11999999999" \
  -F "address=Rua X, 123" \
  -F "city=São Paulo" \
  -F "state=SP" \
  -F "zipCode=01234-567" \
  -F "logo=@/path/to/logo.png"
```

### 2. Com Postman
1. Criar novo POST request para `http://localhost:3011/api/establishments`
2. Ir para aba "Body"
3. Selecionar "form-data"
4. Adicionar campos:
   - `name` (text): "Meu Estabelecimento"
   - `cnpj` (text): "12.345.678/0001-90"
   - `email` (text): "contato@estabelecimento.com"
   - `phone` (text): "11999999999"
   - `address` (text): "Rua X, 123"
   - `city` (text): "São Paulo"
   - `state` (text): "SP"
   - `zipCode` (text): "01234-567"
   - `logo` (file): Selecionar arquivo PNG/JPG
5. Adicionar header: `Authorization: Bearer <token>`
6. Enviar request

### 3. Sem Logo (Opcional)
```bash
curl -X POST http://localhost:3011/api/establishments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Estabelecimento",
    "cnpj": "12.345.678/0001-90",
    "email": "contato@estabelecimento.com",
    "phone": "11999999999",
    "address": "Rua X, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  }'
```

## Dependências Utilizadas

✅ `@nestjs/platform-express` - FileInterceptor (já instalado)
✅ `axios` - HTTP client (já instalado)
✅ `@nestjs/swagger` - Documentação (já instalado)

## Tratamento de Erros

### Erro: Upload Service não disponível
```
Error: Failed to upload logo: connect ECONNREFUSED 127.0.0.1:3008
```
**Solução:** Iniciar o serviço de upload: `npm run start:dev` em `services/upload`

### Erro: Arquivo muito grande
```
Error: File too large
```
**Solução:** Aumentar limite no controller ou validar tamanho

### Erro: Tipo de arquivo inválido
```
Error: Invalid file type
```
**Solução:** Validar extensão (PNG, JPG, etc.)

## Próximos Passos (Opcional)

1. **Validação de arquivo:**
   - Validar tipo MIME (image/png, image/jpeg)
   - Validar tamanho máximo (ex: 5MB)
   - Validar dimensões da imagem

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

✅ Controller aceita multipart/form-data
✅ Serviço chama Upload Service via HTTP
✅ Logo URL salvo no banco de dados
✅ Sem erros de compilação TypeScript
✅ Variável de ambiente configurada
✅ Tratamento de erros implementado

## Resumo

A integração está **100% funcional**. O serviço de estabelecimentos agora:
- Aceita upload de logo durante criação
- Envia arquivo para o serviço de upload
- Salva URL do logo no banco de dados
- Trata erros de upload graciosamente
- Documenta endpoint no Swagger
