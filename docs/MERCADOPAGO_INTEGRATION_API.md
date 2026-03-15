# MercadoPago Integration API

Documentação completa para implementar a integração com Mercado Pago no frontend.

**Base path**: `/api/business/establishments/mercadopago`

**Auth**: JWT obrigatório em todos os endpoints. O `establishmentId` é extraído automaticamente do token JWT.

---

## Endpoints

### POST `/api/business/establishments/mercadopago/connect`

Conecta o estabelecimento ao Mercado Pago com as credenciais da conta.

**Body**:
```json
{
  "accessToken": "APP_USR-1234567890-XXXXX",
  "publicKey": "APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `accessToken` | string | sim | min 10 chars |
| `publicKey` | string | sim | min 10 chars |

**Response 200**:
```json
{
  "id": "uuid",
  "establishmentId": "uuid",
  "isActive": true,
  "isVerified": true,
  "createdAt": "2026-03-11T23:00:00Z",
  "updatedAt": "2026-03-11T23:00:00Z"
}
```

**Erros**:
- `400` — Credenciais inválidas
- `401` — Não autenticado

**Comportamento**: Se já existir uma integração, ela é atualizada com as novas credenciais. Se não existir, cria uma nova.

---

### GET `/api/business/establishments/mercadopago/integration`

Retorna os dados da integração atual do estabelecimento.

**Response 200**:
```json
{
  "id": "uuid",
  "establishmentId": "uuid",
  "isActive": true,
  "isVerified": true,
  "merchantName": "Minha Loja",
  "merchantEmail": "loja@email.com",
  "createdAt": "2026-03-11T23:00:00Z",
  "updatedAt": "2026-03-11T23:00:00Z"
}
```

**Erros**:
- `404` — Integração não encontrada (estabelecimento ainda não conectou)

> Nota: `accessToken` e `publicKey` não são retornados por segurança.

---

### DELETE `/api/business/establishments/mercadopago/disconnect`

Remove a integração do Mercado Pago do estabelecimento.

**Response**: `204 No Content`

**Erros**:
- `404` — Integração não encontrada

---

### POST `/api/business/establishments/mercadopago/payment-preference`

Cria uma preferência de pagamento para redirecionar o cliente ao checkout do Mercado Pago.

**Body**:
```json
{
  "saleId": "uuid-da-venda",
  "items": [
    {
      "id": "item-1",
      "title": "Produto A",
      "description": "Descrição opcional",
      "quantity": 2,
      "unitPrice": 50.00
    }
  ],
  "totalAmount": 100.00,
  "customerEmail": "cliente@email.com",
  "customerName": "João Silva",
  "externalReference": "ref-externa-opcional"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `saleId` | string | sim | ID da venda no sistema |
| `items` | array | sim | Lista de itens |
| `items[].id` | string | sim | ID do item |
| `items[].title` | string | sim | Nome do produto |
| `items[].description` | string | não | Descrição |
| `items[].quantity` | number | sim | Quantidade |
| `items[].unitPrice` | number | sim | Preço unitário em R$ |
| `totalAmount` | number | sim | Valor total em R$ |
| `customerEmail` | string | não | Email do cliente |
| `customerName` | string | não | Nome do cliente |
| `externalReference` | string | não | Referência externa (default: saleId) |

**Response 201**:
```json
{
  "preferenceId": "123456789-abcd-1234-efgh-987654321098",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

**Erros**:
- `400` — Dados inválidos
- `404` — Integração ativa não encontrada

**Uso**: Redirecionar o usuário para `initPoint` (produção) ou `sandboxInitPoint` (testes).

---

### GET `/api/business/establishments/mercadopago/payment/:paymentId`

Retorna os detalhes de um pagamento específico.

**Params**: `paymentId` — ID do pagamento retornado pelo Mercado Pago

**Response 200**: Objeto completo do pagamento conforme API do Mercado Pago.

Campos relevantes:
```json
{
  "id": 123456789,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 100.00,
  "currency_id": "BRL",
  "payment_method_id": "pix",
  "payer": {
    "email": "cliente@email.com"
  },
  "external_reference": "uuid-da-venda",
  "date_approved": "2026-03-11T23:05:00Z"
}
```

**Status possíveis do pagamento**:
| Status | Descrição |
|---|---|
| `pending` | Aguardando pagamento |
| `approved` | Aprovado |
| `authorized` | Autorizado |
| `in_process` | Em análise |
| `in_mediation` | Em disputa |
| `rejected` | Rejeitado |
| `cancelled` | Cancelado |
| `refunded` | Reembolsado |
| `charged_back` | Estornado |

---

## Banco de Dados

Tabela: `establishment_mercadopago_integrations`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | varchar(36) | UUID primário |
| `establishmentId` | varchar(36) | FK para `business_establishments` |
| `accessToken` | varchar(255) | Token de acesso MP |
| `publicKey` | varchar(255) | Chave pública MP |
| `merchantAccountId` | varchar(255) | ID da conta MP (nullable) |
| `merchantName` | varchar(255) | Nome do lojista (nullable) |
| `merchantEmail` | varchar(255) | Email do lojista (nullable) |
| `isActive` | boolean | Integração ativa |
| `isVerified` | boolean | Credenciais verificadas |
| `webhookConfig` | json | Config do webhook |
| `metadata` | json | Dados extras (connectedAt, syncStatus) |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Última atualização |
| `deletedAt` | timestamp | Soft delete |

---

## Fluxo Completo no Frontend

### 1. Tela de Configuração (Settings > Pagamentos > Mercado Pago)

```
1. GET /integration
   ├── 200 → Exibir status conectado + merchantName/email
   └── 404 → Exibir formulário de conexão

2. Formulário de conexão:
   - Input: Access Token
   - Input: Public Key
   - Botão "Conectar"
   → POST /connect

3. Se conectado:
   - Exibir badge "Conectado ✓"
   - Botão "Desconectar" → DELETE /disconnect
```

### 2. Fluxo de Pagamento (PDV / Checkout)

```
1. Venda finalizada no sistema
2. POST /payment-preference com os itens da venda
3. Receber initPoint
4. Redirecionar cliente para initPoint
5. Mercado Pago processa o pagamento
6. Webhook notifica o backend (automático)
7. GET /payment/:paymentId para confirmar status
```

### 3. Back URLs (configuradas automaticamente pelo backend)

| Evento | URL |
|---|---|
| Sucesso | `{APP_URL}/payment/success?saleId={saleId}` |
| Falha | `{APP_URL}/payment/failure?saleId={saleId}` |
| Pendente | `{APP_URL}/payment/pending?saleId={saleId}` |

---

## Onde obter as credenciais

1. Acessar [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers)
2. Ir em **Suas integrações** → selecionar ou criar aplicação
3. Em **Credenciais de produção**:
   - `Access Token` → campo `accessToken`
   - `Public Key` → campo `publicKey`
4. Para testes, usar **Credenciais de teste** (sandbox)

---

## Exemplo de Integração (TypeScript)

```typescript
const mercadoPagoApi = {
  connect: (data: { accessToken: string; publicKey: string }) =>
    api.post('/api/business/establishments/mercadopago/connect', data),

  getIntegration: () =>
    api.get('/api/business/establishments/mercadopago/integration'),

  disconnect: () =>
    api.delete('/api/business/establishments/mercadopago/disconnect'),

  createPaymentPreference: (data: CreatePaymentPreferenceDto) =>
    api.post('/api/business/establishments/mercadopago/payment-preference', data),

  getPayment: (paymentId: string) =>
    api.get(`/api/business/establishments/mercadopago/payment/${paymentId}`),
};

// Exemplo de uso no checkout
async function checkoutWithMercadoPago(sale: Sale) {
  const { data } = await mercadoPagoApi.createPaymentPreference({
    saleId: sale.id,
    items: sale.items.map(item => ({
      id: item.id,
      title: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    totalAmount: sale.total,
    customerEmail: sale.customer?.email,
    customerName: sale.customer?.name,
  });

  // Redirecionar para o checkout
  window.location.href = data.initPoint; // produção
  // window.location.href = data.sandboxInitPoint; // testes
}
```

---

## Tratamento de Erros

```typescript
async function connectMercadoPago(accessToken: string, publicKey: string) {
  try {
    await mercadoPagoApi.connect({ accessToken, publicKey });
    toast.success('Mercado Pago conectado com sucesso!');
  } catch (error) {
    if (error.response?.status === 400) {
      toast.error('Credenciais inválidas. Verifique o Access Token e a Public Key.');
    } else {
      toast.error('Erro ao conectar. Tente novamente.');
    }
  }
}

async function loadIntegration() {
  try {
    const { data } = await mercadoPagoApi.getIntegration();
    setIntegration(data);
  } catch (error) {
    if (error.response?.status === 404) {
      setIntegration(null); // não conectado ainda
    }
  }
}
```
