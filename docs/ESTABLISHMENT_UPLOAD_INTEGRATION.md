# Establishment - Upload Service Integration Analysis

## Status: ❌ NÃO INTEGRADO

O serviço de estabelecimentos no business **NÃO chama o serviço de upload** atualmente.

## Análise Atual

### Entidade Establishment
A entidade tem um campo `logo`:
```typescript
@Column({ type: 'varchar', length: 500, nullable: true })
logo: string;
```

### Serviço de Estabelecimentos
O `EstablishmentsService.create()` **NÃO faz upload de logo**:
- Apenas salva dados básicos (name, cnpj, email, phone, address, etc.)
- Não processa arquivo de logo
- Não chama serviço de upload

### Controller de Estabelecimentos
O `EstablishmentsController.create()` **NÃO aceita upload de arquivo**:
- Apenas aceita JSON no body
- Não tem `@UseInterceptors(FileInterceptor())`
- Não tem suporte a multipart/form-data

## O que Precisa Ser Feito

### 1. Atualizar o Controller
Adicionar suporte a upload de arquivo:

```typescript
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile } from '@nestjs/common';

@Post()
@UseInterceptors(FileInterceptor('logo'))
async create(
  @Body() createEstablishmentDto: any,
  @UploadedFile() file: Express.Multer.File,
  @Request() req: any
) {
  const userId = req.user?.id;
  return this.establishmentsService.create(createEstablishmentDto, userId, file);
}
```

### 2. Atualizar o Serviço
Integrar com o serviço de upload:

```typescript
async create(createEstablishmentDto: any, userId: string, logoFile?: Express.Multer.File) {
  try {
    let logoUrl = null;
    
    // Upload logo se fornecido
    if (logoFile) {
      logoUrl = await this.uploadService.uploadFile(logoFile, 'establishments');
    }

    // Criar estabelecimento
    const establishment = this.establishmentsRepository.create({
      ...createEstablishmentDto,
      ownerId: userId,
      logo: logoUrl,
      isActive: true,
    });

    return await this.establishmentsRepository.save(establishment);
  } catch (error) {
    this.logger.error(`Error creating establishment: ${error.message}`);
    throw error;
  }
}
```

### 3. Atualizar o Módulo
Importar o módulo de upload:

```typescript
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([...]),
    UploadModule,
  ],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
})
export class EstablishmentsModule {}
```

### 4. Injetar o Serviço de Upload
No serviço de estabelecimentos:

```typescript
constructor(
  @InjectRepository(Establishment)
  private establishmentsRepository: Repository<Establishment>,
  private uploadService: UploadService,
  // ... outros repositórios
) {}
```

## Fluxo Proposto

```
Cliente
  ↓
POST /api/establishments (multipart/form-data)
  ├─ name, cnpj, email, phone, address, etc.
  └─ logo (arquivo)
  ↓
EstablishmentsController.create()
  ↓
EstablishmentsService.create()
  ├─ Chama UploadService.uploadFile(logoFile)
  │  ├─ Upload para S3 ou FTP
  │  └─ Retorna URL do arquivo
  ├─ Salva establishment com logo URL
  └─ Publica evento Kafka: establishment.created
  ↓
Resposta com establishment criado + logo URL
```

## Integração com Kafka

Após criar o estabelecimento, publicar evento:

```typescript
// No serviço de estabelecimentos
async create(createEstablishmentDto: any, userId: string, logoFile?: Express.Multer.File) {
  // ... criar establishment ...
  
  // Publicar evento
  await this.kafkaProducer.send({
    topic: 'establishment.created',
    messages: [{
      key: savedEstablishment.id,
      value: JSON.stringify({
        id: savedEstablishment.id,
        name: savedEstablishment.name,
        ownerId: userId,
        logoUrl: logoUrl,
        timestamp: new Date(),
      }),
    }],
  });
  
  return savedEstablishment;
}
```

## Próximos Passos

1. **Criar serviço de upload no business** (ou importar do upload service)
2. **Atualizar controller** para aceitar arquivo
3. **Atualizar serviço** para processar upload
4. **Atualizar módulo** para importar UploadModule
5. **Adicionar Kafka producer** para publicar eventos
6. **Testar fluxo completo** com Postman

## Exemplo de Request

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

## Benefícios da Integração

✅ Logo armazenado em S3/FTP (não no banco)
✅ Eventos publicados no Kafka para outros serviços
✅ Fluxo assíncrono e escalável
✅ Rastreamento de criação de estabelecimentos
✅ Possibilidade de processamento de imagem (resize, etc.)
