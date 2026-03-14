# Integração de Autenticação no Monolith

## Visão Geral

O monolith agora valida todos os tokens JWT com o auth service, sem manter uma tabela de usuários local. O fluxo é:

```
Frontend (com JWT)
  ↓
Monolith recebe requisição
  ↓
AuthGuard valida token com Auth Service
  ↓
Auth Service retorna dados do usuário
  ↓
Monolith injeta userId no request
  ↓
Controller/Service usa userId do request
```

## Como Usar

### 1. Adicionar AuthGuard em Rotas Protegidas

```typescript
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/purchases')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPurchase(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() userId: string
  ) {
    return this.purchasesService.create(userId, dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getPurchase(
    @Param('id') id: string,
    @CurrentUser() userId: string
  ) {
    return this.purchasesService.findOne(id, userId);
  }
}
```

### 2. Usar o Decorator @CurrentUser()

O decorator extrai o `userId` do request que foi injetado pelo AuthGuard:

```typescript
@CurrentUser() userId: string
```

### 3. Remover userId dos Parâmetros

**Antes:**
```typescript
@Post(':userId/purchases')
async createPurchase(@Param('userId') userId: string, @Body() dto: CreatePurchaseDto)
```

**Depois:**
```typescript
@Post()
@UseGuards(AuthGuard)
async createPurchase(@Body() dto: CreatePurchaseDto, @CurrentUser() userId: string)
```

## Fluxo de Validação

1. **Frontend envia JWT no header Authorization**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

2. **AuthGuard intercepta a requisição**
   - Extrai o token do header
   - Chama `AuthValidationService.validateToken(token)`

3. **AuthValidationService valida com Auth Service**
   - Faz POST para `/api/auth/verify-token`
   - Passa o token no header Authorization
   - Recebe dados do usuário se válido

4. **Dados do usuário são injetados no request**
   ```typescript
   request.user = {
     id: 'user-123',
     email: 'user@example.com',
     firstName: 'John',
     lastName: 'Doe',
     isActive: true
   }
   ```

5. **Controller acessa via @CurrentUser()**
   ```typescript
   @CurrentUser() userId: string // 'user-123'
   ```

## Configuração

### 1. Adicionar AuthValidationService ao Common Module

```typescript
// common/common.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthValidationService } from './services/auth-validation.service';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [HttpModule],
  providers: [AuthValidationService, AuthGuard],
  exports: [AuthValidationService, AuthGuard],
})
export class CommonModule {}
```

### 2. Importar CommonModule nos Módulos que Precisam

```typescript
// purchases/purchases.module.ts
import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [CommonModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
```

### 3. Variáveis de Ambiente

Certifique-se de que `AUTH_SERVICE_URL` está configurado no `.env`:

```env
AUTH_SERVICE_URL=http://localhost:3001
```

## Tratamento de Erros

### Token Inválido
```
Status: 401 Unauthorized
Body: { message: 'Invalid token' }
```

### Token Expirado
```
Status: 401 Unauthorized
Body: { message: 'Invalid token' }
```

### Header Ausente
```
Status: 401 Unauthorized
Body: { message: 'Missing authorization header' }
```

## Exemplo Completo

```typescript
import { Controller, Post, Get, UseGuards, Body, Param } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Controller('api/purchases')
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPurchase(
    @Body() dto: CreatePurchaseDto,
    @CurrentUser() userId: string
  ) {
    return this.purchasesService.create(userId, dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async listPurchases(@CurrentUser() userId: string) {
    return this.purchasesService.findByUser(userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getPurchase(
    @Param('id') id: string,
    @CurrentUser() userId: string
  ) {
    return this.purchasesService.findOne(id, userId);
  }
}
```

## Benefícios

✅ Sem tabela de usuários no monolith
✅ Validação centralizada no auth service
✅ Dados sempre sincronizados
✅ Sem latência de chamadas síncronas (validação é rápida)
✅ Melhor separação de responsabilidades
✅ Fácil de implementar em outras aplicações

## Próximos Passos

1. Adicionar CommonModule ao app.module.ts
2. Atualizar todos os controllers para usar @UseGuards(AuthGuard)
3. Remover userId dos parâmetros de rota
4. Remover tabela user do monolith
5. Testar fluxo completo
