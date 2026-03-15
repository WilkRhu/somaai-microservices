# Loyalty Settings API

Documentação completa para implementar o programa de fidelidade no frontend.

---

## Endpoints

### GET `/api/business/establishments/:id/loyalty-settings`

Retorna as configurações atuais do programa de fidelidade do estabelecimento.

**Auth**: JWT obrigatório (OWNER ou membro do estabelecimento)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "loyaltyEnabled": true,
    "loyaltyPointsPerReal": 0.1,
    "description": "0.1 pontos por real gasto",
    "example": "R$ 10,00 = 1 pontos"
  }
}
```

---

### PATCH `/api/business/establishments/:id/loyalty-settings`

Atualiza as configurações do programa de fidelidade.

**Auth**: JWT obrigatório — apenas **OWNER** pode alterar

**Body**:
```json
{
  "loyaltyEnabled": true,
  "loyaltyPointsPerReal": 0.2
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `loyaltyEnabled` | boolean | não | Ativa/desativa o programa |
| `loyaltyPointsPerReal` | number | não | Pontos por R$ 1,00 gasto. Min: 0, Max: 10 |

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "a32b8148-6358-4bc2-ac5d-90a24f5c4333",
    "loyaltyEnabled": true,
    "loyaltyPointsPerReal": 0.2
  },
  "message": "Configuração de fidelidade atualizada com sucesso"
}
```

**Erros possíveis**:
- `403` — Usuário não é OWNER do estabelecimento
- `404` — Estabelecimento não encontrado

---

## Endpoints de Pontos do Cliente

### GET `/api/business/establishments/:id/customers/:customerId/loyalty`

Retorna o saldo de pontos de um cliente.

**Response 200**:
```json
{
  "customerId": "uuid",
  "customerName": "João da Silva",
  "currentPoints": 150,
  "totalEarned": 150,
  "totalRedeemed": 0
}
```

---

### POST `/api/business/establishments/:id/customers/:customerId/loyalty/add`

Adiciona pontos ao cliente.

**Body**:
```json
{
  "points": 10
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `points` | integer | sim | Mínimo: 1 |

---

### POST `/api/business/establishments/:id/customers/:customerId/loyalty/redeem`

Resgata pontos do cliente.

**Body**:
```json
{
  "points": 50
}
```

**Erro se saldo insuficiente**:
```json
{
  "statusCode": 400,
  "message": "Saldo insuficiente. Cliente possui 30 pontos"
}
```

---

## Lógica de Cálculo

O campo `loyaltyPointsPerReal` define quantos pontos o cliente ganha por R$ 1,00 gasto.

```
pontos = Math.floor(valorDaCompra * loyaltyPointsPerReal)
```

**Exemplos**:

| `loyaltyPointsPerReal` | Compra R$ 10 | Compra R$ 50 | Compra R$ 100 |
|---|---|---|---|
| `0.1` (padrão) | 1 ponto | 5 pontos | 10 pontos |
| `0.2` | 2 pontos | 10 pontos | 20 pontos |
| `1.0` | 10 pontos | 50 pontos | 100 pontos |

---

## Campos no Banco de Dados

Tabela: `business_establishments`

| Coluna | Tipo | Default | Descrição |
|---|---|---|---|
| `loyalty_enabled` | boolean | `true` | Programa ativo ou não |
| `loyalty_points_per_real` | decimal(5,3) | `0.1` | Pontos por R$ 1,00 |

Tabela: `business_customers`

| Coluna | Tipo | Default | Descrição |
|---|---|---|---|
| `loyaltyPoints` | int | `0` | Saldo atual de pontos |
| `totalSpent` | decimal(10,2) | `0` | Total gasto pelo cliente |
| `purchaseCount` | int | `0` | Número de compras |
| `lastPurchaseDate` | timestamp | null | Data da última compra |

---

## Permissões

| Ação | Role necessária |
|---|---|
| Ver configurações | Qualquer membro do estabelecimento |
| Alterar configurações | Somente OWNER |
| Ver pontos do cliente | Qualquer membro |
| Adicionar pontos | Qualquer membro |
| Resgatar pontos | Qualquer membro |

---

## Fluxo Sugerido no Frontend

### Tela de Configuração (Settings > Fidelidade)

1. `GET /loyalty-settings` ao carregar a tela
2. Exibir toggle para `loyaltyEnabled`
3. Exibir input numérico para `loyaltyPointsPerReal` com preview do cálculo
4. Ao salvar: `PATCH /loyalty-settings`
5. Exibir feedback de sucesso/erro

**Preview dinâmico** (atualiza conforme o usuário digita):
```
R$ 10,00 = {Math.floor(10 * loyaltyPointsPerReal)} pontos
R$ 50,00 = {Math.floor(50 * loyaltyPointsPerReal)} pontos
R$ 100,00 = {Math.floor(100 * loyaltyPointsPerReal)} pontos
```

### Tela do Cliente (Perfil do Cliente)

1. `GET /customers/:id/loyalty` ao abrir o perfil
2. Exibir saldo atual de pontos
3. Botão "Adicionar pontos" → `POST /loyalty/add`
4. Botão "Resgatar pontos" → `POST /loyalty/redeem`

---

## Exemplo de Integração (TypeScript)

```typescript
const loyaltyApi = {
  getSettings: (establishmentId: string) =>
    api.get(`/business/establishments/${establishmentId}/loyalty-settings`),

  updateSettings: (establishmentId: string, data: {
    loyaltyEnabled?: boolean;
    loyaltyPointsPerReal?: number;
  }) =>
    api.patch(`/business/establishments/${establishmentId}/loyalty-settings`, data),

  getCustomerPoints: (establishmentId: string, customerId: string) =>
    api.get(`/business/establishments/${establishmentId}/customers/${customerId}/loyalty`),

  addPoints: (establishmentId: string, customerId: string, points: number) =>
    api.post(`/business/establishments/${establishmentId}/customers/${customerId}/loyalty/add`, { points }),

  redeemPoints: (establishmentId: string, customerId: string, points: number) =>
    api.post(`/business/establishments/${establishmentId}/customers/${customerId}/loyalty/redeem`, { points }),
};
```
