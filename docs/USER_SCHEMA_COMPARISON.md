# Comparação de Schemas - User Auth vs User Monolith

## Resumo Executivo

| Aspecto | Auth | Monolith | Status |
|---------|------|----------|--------|
| Campos | 18 | 31 | ⚠️ Monolith tem 13 campos a mais |
| Relacionamentos | 0 | 3 | ⚠️ Monolith tem relacionamentos |
| Índices | 1 (email) | 2 (cpf, email) | ✅ Monolith mais otimizado |
| Propósito | Autenticação | Negócio | ✅ Separação clara |

---

## Campos Comuns (Sincronizados)

| Campo | Auth | Monolith | Tipo | Notas |
|-------|------|----------|------|-------|
| id | ✅ | ✅ | UUID | Mesmo ID em ambos |
| email | ✅ | ✅ | varchar(255) | Unique em ambos |
| firstName | ✅ | ✅ | varchar(255) | ✅ Sincronizado |
| lastName | ✅ | ✅ | varchar(255) | ✅ Sincronizado |
| password | ✅ | ✅ | varchar(255) | ⚠️ Não sincronizado (segurança) |
| authProvider | ✅ | ✅ | enum | ✅ Sincronizado |
| googleId | ✅ | ✅ | varchar(255) | ✅ Sincronizado |
| facebookId | ✅ | ✅ | varchar(255) | ✅ Sincronizado |
| role | ✅ | ✅ | enum | ✅ Sincronizado |
| avatar | ✅ | ✅ | text/varchar | ✅ Sincronizado |
| isActive | ✅ | ✅ | boolean | ✅ Sincronizado |
| emailVerified | ✅ | ✅ | boolean | ✅ Sincronizado |
| phone | ✅ | ✅ | varchar(20) | ✅ Sincronizado |
| planType | ✅ | ✅ | varchar(50) | ✅ Sincronizado |
| planExpiresAt | ✅ | ✅ | datetime | ✅ Sincronizado |
| billingCycle | ✅ | ✅ | varchar(20) | ✅ Sincronizado |
| createdAt | ✅ | ✅ | timestamp | ✅ Sincronizado |
| updatedAt | ✅ | ✅ | timestamp | ✅ Sincronizado |
| lastLogin | ✅ | ✅ | timestamp | ✅ Sincronizado |

---

## Campos Exclusivos do Monolith

| Campo | Tipo | Propósito | Necessário? |
|-------|------|----------|------------|
| cpf | varchar(14) | Identificação brasileira | ✅ Sim (negócio) |
| birthDate | date | Dados pessoais | ✅ Sim (negócio) |
| isOnTrial | boolean | Status de trial | ✅ Sim (negócio) |
| trialEndsAt | datetime | Expiração de trial | ✅ Sim (negócio) |
| mercadoPagoCustomerId | varchar(255) | Integração pagamento | ✅ Sim (pagamento) |
| hasCompletedOnboarding | boolean | Status onboarding | ✅ Sim (UX) |
| netIncome | decimal(10,2) | Renda líquida | ✅ Sim (negócio) |
| profession | varchar(255) | Profissão do usuário | ✅ Sim (negócio) |
| scansUsed | int | Contador de scans | ✅ Sim (limite) |
| scansResetAt | datetime | Reset de scans | ✅ Sim (limite) |

---

## Campos Exclusivos do Auth

| Campo | Tipo | Propósito | Notas |
|-------|------|----------|-------|
| Nenhum | - | - | Auth é minimalista (apenas autenticação) |

---

## Relacionamentos

### Auth Service
```
User
├── Nenhum relacionamento
└── Apenas dados de autenticação
```

### Monolith Service
```
User
├── OneToMany → UserAddress (cascade)
├── OneToMany → UserCard (cascade)
└── OneToMany → Purchase (cascade)
```

**Impacto:** Monolith é responsável por dados de negócio, Auth apenas por autenticação.

---

## Índices

### Auth
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### Monolith
```sql
CREATE UNIQUE INDEX idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL;
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Análise:** Monolith tem índice adicional para CPF (documento brasileiro).

---

## Problemas Identificados

### 1. ⚠️ Campos Duplicados Desnecessários

**Problema:** Monolith tem campos que deveriam estar apenas no Auth:
- `password` - Deveria estar apenas no Auth
- `authProvider` - Deveria estar apenas no Auth
- `googleId` - Deveria estar apenas no Auth
- `facebookId` - Deveria estar apenas no Auth

**Impacto:** Duplicação de dados, risco de inconsistência

**Solução Recomendada:**
```typescript
// Auth Service (mantém)
- password
- authProvider
- googleId
- facebookId

// Monolith Service (remove)
- password (não sincronizar)
- authProvider (apenas referência)
- googleId (apenas referência)
- facebookId (apenas referência)
```

### 2. ⚠️ Campos de Negócio no Auth

**Problema:** Auth tem campos que deveriam estar apenas no Monolith:
- `planType` - Negócio
- `planExpiresAt` - Negócio
- `billingCycle` - Negócio

**Impacto:** Auth fica responsável por lógica de negócio

**Solução Recomendada:**
```typescript
// Auth Service (remove)
- planType
- planExpiresAt
- billingCycle

// Monolith Service (mantém)
- planType
- planExpiresAt
- billingCycle
```

### 3. ⚠️ Falta de Campos Importantes no Auth

**Problema:** Auth não tem campos que Monolith tem:
- `cpf` - Identificação
- `birthDate` - Dados pessoais
- `isOnTrial` - Status
- `trialEndsAt` - Status
- `mercadoPagoCustomerId` - Integração
- `hasCompletedOnboarding` - Status
- `netIncome` - Dados financeiros
- `profession` - Dados pessoais
- `scansUsed` - Limite
- `scansResetAt` - Limite

**Impacto:** Dados de negócio não estão no Auth

**Solução:** Esses campos devem ficar APENAS no Monolith

### 4. ⚠️ Tipo de Avatar Inconsistente

**Auth:** `text`
**Monolith:** `varchar(500)`

**Solução:** Padronizar em `varchar(500)` em ambos

---

## Arquitetura Recomendada

### Separação de Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTH SERVICE                             │
│                                                             │
│  Responsabilidade: Autenticação e Autorização              │
│                                                             │
│  Campos:                                                    │
│  ├── id (UUID)                                             │
│  ├── email (unique)                                        │
│  ├── password (hashed)                                     │
│  ├── firstName                                             │
│  ├── lastName                                              │
│  ├── phone                                                 │
│  ├── avatar                                                │
│  ├── role (USER, BUSINESS_OWNER, ADMIN)                   │
│  ├── authProvider (EMAIL, GOOGLE, FACEBOOK)               │
│  ├── googleId                                              │
│  ├── facebookId                                            │
│  ├── isActive                                              │
│  ├── emailVerified                                         │
│  ├── lastLogin                                             │
│  ├── createdAt                                             │
│  └── updatedAt                                             │
│                                                             │
│  Sem: CPF, birthDate, planType, trial, onboarding, etc    │
└─────────────────────────────────────────────────────────────┘
                            ↓ Sincroniza
┌─────────────────────────────────────────────────────────────┐
│                   MONOLITH SERVICE                          │
│                                                             │
│  Responsabilidade: Dados de Negócio                        │
│                                                             │
│  Campos Sincronizados do Auth:                             │
│  ├── id (UUID) - mesmo do Auth                             │
│  ├── email                                                 │
│  ├── firstName                                             │
│  ├── lastName                                              │
│  ├── phone                                                 │
│  ├── avatar                                                │
│  ├── role                                                  │
│  ├── isActive                                              │
│  ├── emailVerified                                         │
│  ├── createdAt                                             │
│  └── updatedAt                                             │
│                                                             │
│  Campos Exclusivos do Monolith:                            │
│  ├── cpf (identificação)                                   │
│  ├── birthDate                                             │
│  ├── planType                                              │
│  ├── planExpiresAt                                         │
│  ├── billingCycle                                          │
│  ├── isOnTrial                                             │
│  ├── trialEndsAt                                           │
│  ├── mercadoPagoCustomerId                                 │
│  ├── hasCompletedOnboarding                                │
│  ├── netIncome                                             │
│  ├── profession                                            │
│  ├── scansUsed                                             │
│  ├── scansResetAt                                          │
│  ├── Relacionamentos (Address, Card, Purchase)             │
│  └── Índices (CPF, Email)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Melhorias Recomendadas

### 1. Remover Campos de Negócio do Auth

```typescript
// services/auth/src/auth/entities/user.entity.ts

// REMOVER:
- planType
- planExpiresAt
- billingCycle
```

### 2. Remover Campos de Autenticação do Monolith

```typescript
// services/monolith/src/users/entities/user.entity.ts

// REMOVER:
- password (não sincronizar)
- authProvider (apenas referência)
- googleId (apenas referência)
- facebookId (apenas referência)
```

### 3. Padronizar Tipos

```typescript
// Avatar em ambos: varchar(500)
@Column({ type: 'varchar', length: 500, nullable: true })
avatar: string;
```

### 4. Adicionar Campos Faltantes ao Auth (Opcional)

Se precisar de dados pessoais no Auth:
```typescript
@Column({ type: 'varchar', length: 14, nullable: true })
cpf: string;

@Column({ type: 'date', nullable: true })
birthDate: Date;

@Column({ type: 'varchar', length: 255, nullable: true })
profession: string;
```

---

## Impacto das Mudanças

| Mudança | Impacto | Esforço | Benefício |
|---------|--------|--------|----------|
| Remover campos de negócio do Auth | Baixo | Baixo | Alto |
| Remover campos de auth do Monolith | Médio | Médio | Alto |
| Padronizar tipos | Baixo | Baixo | Médio |
| Adicionar campos ao Auth | Médio | Médio | Médio |

---

## Próximos Passos

1. **Curto Prazo (Imediato)**
   - ✅ Manter sincronização funcionando
   - ✅ Testar com novos usuários

2. **Médio Prazo (Sprint Próxima)**
   - Remover campos de negócio do Auth
   - Remover campos de auth do Monolith
   - Padronizar tipos

3. **Longo Prazo (Refatoração)**
   - Considerar adicionar campos pessoais ao Auth
   - Implementar validações de sincronização
   - Adicionar testes de integridade de dados

---

## Conclusão

A arquitetura atual está funcionando, mas pode ser otimizada:

✅ **Pontos Positivos:**
- Sincronização funcionando
- Separação clara de responsabilidades
- Monolith tem dados de negócio

⚠️ **Pontos a Melhorar:**
- Remover duplicação de campos
- Padronizar tipos
- Clarificar responsabilidades

🎯 **Objetivo:** Auth = Autenticação, Monolith = Negócio
