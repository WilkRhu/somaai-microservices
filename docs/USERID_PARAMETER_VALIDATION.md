# Validação de userId como Parâmetro

## Problema
Quando você passa `userId` como parâmetro na rota, precisa validar que o usuário está acessando seus próprios dados (ou é admin).

## Solução
Use o decorator `@ValidateUserId()` que valida automaticamente que o `userId` do parâmetro bate com o `userId` do token JWT.

## Como Usar

### Opção 1: Com @ValidateUserId (Recomendado)

```typescript
import { ValidateUserId } from '../common/decorators/validate-user-id.decorator';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('api/users')
@UseGuards(AuthGuard)
export class UsersController {
  @Get(':userId/profile')
  async getProfile(
    @ValidateUserId('userId') userId: string
  ) {
    return this.usersService.getProfile(userId);
  }

  @Put(':userId/profile')
  async updateProfile(
    @ValidateUserId('userId') userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(userId, dto);
  }
}
```

### Opção 2: Com @Param + Validação Manual

```typescript
@Get(':userId/profile')
async getProfile(
  @Param('userId') userId: string,
  @CurrentUser() tokenUserId: string
) {
  if (userId !== tokenUserId) {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
  return this.usersService.getProfile(userId);
}
```

### Opção 3: Sem Parâmetro (Mais Simples)

```typescript
@Get('profile')
async getProfile(@CurrentUser() userId: string) {
  return this.usersService.getProfile(userId);
}
```

## Fluxo de Validação

```
1. Frontend envia requisição
   GET /api/users/123/profile
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. AuthGuard valida token
   - Token contém userId: "123"
   - Injeta em request.user.id

3. @ValidateUserId('userId') valida
   - Extrai userId do parâmetro: "123"
   - Compara com request.user.id: "123"
   - Se bater, passa userId para o método
   - Se não bater, lança 403 Forbidden

4. Controller recebe userId validado
   async getProfile(@ValidateUserId('userId') userId: string)
```

## Exemplos Práticos

### Exemplo 1: Purchases com userId no path

**Antes:**
```typescript
@Controller('api/users/:userId/purchases')
export class PurchasesController {
  @Get()
  async list(@Param('userId') userId: string) {
    return this.purchasesService.findByUser(userId);
  }
}
```

**Depois:**
```typescript
@Controller('api/purchases')
@UseGuards(AuthGuard)
export class PurchasesController {
  @Get()
  async list(@CurrentUser() userId: string) {
    return this.purchasesService.findByUser(userId);
  }
}
```

**Ou com parâmetro:**
```typescript
@Controller('api/users')
@UseGuards(AuthGuard)
export class PurchasesController {
  @Get(':userId/purchases')
  async list(@ValidateUserId('userId') userId: string) {
    return this.purchasesService.findByUser(userId);
  }
}
```

### Exemplo 2: Subscriptions

```typescript
@Controller('api/subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  @Post()
  async create(
    @Body() dto: CreateSubscriptionDto,
    @CurrentUser() userId: string
  ) {
    return this.subscriptionsService.create(userId, dto);
  }

  @Get(':subscriptionId')
  async findById(
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUser() userId: string
  ) {
    return this.subscriptionsService.findById(subscriptionId, userId);
  }
}
```

### Exemplo 3: Admin Routes

```typescript
@Controller('api/admin/users')
@UseGuards(AuthGuard, RoleGuard)
@Roles('ADMIN')
export class AdminUsersController {
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    // Admin pode acessar qualquer usuário
    return this.usersService.getUserById(userId);
  }

  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.usersService.updateUser(userId, dto);
  }
}
```

## Tratamento de Erros

### Acesso Negado (userId não bate)
```
Status: 403 Forbidden
Body: { message: 'Cannot access another user\'s data' }
```

### Não Autenticado
```
Status: 401 Unauthorized
Body: { message: 'User not authenticated' }
```

## Comparação de Abordagens

| Abordagem | Vantagem | Desvantagem |
|-----------|----------|------------|
| `@CurrentUser()` | Simples, sem parâmetro | Não mostra userId na rota |
| `@ValidateUserId()` | Valida automaticamente | Precisa de parâmetro |
| Validação manual | Flexível | Código repetitivo |

## Recomendação

- **Para rotas de usuário:** Use `@CurrentUser()` (mais simples)
- **Para rotas com userId no path:** Use `@ValidateUserId()` (valida automaticamente)
- **Para rotas admin:** Não valide userId (admin acessa tudo)

## Exemplo Completo

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ValidateUserId } from '../common/decorators/validate-user-id.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/users')
@UseGuards(AuthGuard)
export class UsersController {
  // Rota pública (sem userId no path)
  @Get('profile')
  async getProfile(@CurrentUser() userId: string) {
    return this.usersService.getProfile(userId);
  }

  // Rota com userId validado
  @Get(':userId/purchases')
  async getPurchases(@ValidateUserId('userId') userId: string) {
    return this.purchasesService.findByUser(userId);
  }

  // Rota admin (sem validação de userId)
  @Get('admin/all')
  @UseGuards(RoleGuard)
  @Roles('ADMIN')
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
```

## Próximos Passos

1. Usar `@ValidateUserId()` em rotas que têm userId no path
2. Usar `@CurrentUser()` em rotas sem userId no path
3. Remover validações manuais de userId
4. Testar fluxo completo
