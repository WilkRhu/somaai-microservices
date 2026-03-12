# Documentação de Rotas do Backend

## Índice
1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Produtos](#produtos)
4. [Compras](#compras)
5. [Preços](#preços)
6. [Pagamentos](#pagamentos)
7. [Assinaturas](#assinaturas)
8. [Notificações](#notificações)
9. [Listas de Compras](#listas-de-compras)
10. [Tickets](#tickets)
11. [Relatórios](#relatórios)
12. [OCR](#ocr)
13. [Scanner](#scanner)
14. [Logs](#logs)
15. [Email](#email)
16. [App](#app)

---

## Autenticação

### POST `/auth/register`
Registra um novo usuário no sistema.
- **Autenticação**: Não requerida
- **Body**: `{ name, email, password, planType? }`
- **Resposta**: `{ success, data: { access_token, user } }`

### POST `/auth/login`
Autentica um usuário e retorna token JWT.
- **Autenticação**: Não requerida
- **Body**: `{ email, password }`
- **Resposta**: `{ success, data: { access_token, user } }`

### POST `/auth/renew`
Renova o token JWT do usuário autenticado.
- **Autenticação**: JWT
- **Body**: `{ userId }`
- **Resposta**: `{ success, data: { access_token, user } }`

### POST `/auth/renew/:userId`
Renova o token JWT para um usuário específico.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, data: { access_token, user } }`

### GET `/auth/me`
Retorna os dados do usuário autenticado.
- **Autenticação**: JWT
- **Resposta**: `{ success, data: user }`

---

## Usuários

### POST `/users`
Cria um novo usuário (role padrão: USER).
- **Autenticação**: Não requerida
- **Body**: `{ name, email, password, planType? }`
- **Resposta**: `{ success, data: user }`

### GET `/users`
Lista todos os usuários (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Resposta**: `{ success, data: user[] }`

### GET `/users/:id`
Retorna dados de um usuário específico.
- **Autenticação**: JWT
- **Parâmetros**: `id` (UUID)
- **Resposta**: `{ success, data: user }`

### PUT `/users/:id`
Atualiza dados de um usuário (PUT).
- **Autenticação**: JWT
- **Parâmetros**: `id` (UUID)
- **Body**: `{ name?, email?, password?, role?, planType?, planExpiresAt? }`
- **Resposta**: `{ success, data: user }`

### PATCH `/users/:id`
Atualiza parcialmente dados de um usuário (PATCH).
- **Autenticação**: JWT
- **Parâmetros**: `id` (UUID)
- **Body**: `{ name?, email?, password?, role? }`
- **Resposta**: `{ success, data: user }`

### DELETE `/users/:id`
Deleta um usuário (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Parâmetros**: `id` (UUID)
- **Resposta**: `{ success, message }`

### POST `/users/:id/avatar`
Realiza upload da foto de perfil do usuário.
- **Autenticação**: JWT
- **Parâmetros**: `id` (UUID)
- **Body**: FormData com `file` (imagem)
- **Resposta**: `{ success, data: user }`

### GET `/users/:id/onboarding/status`
Verifica o status do onboarding do usuário.
- **Autenticação**: JWT
- **Parâmetros**: `id` (UUID)
- **Resposta**: `{ success, data: { completed, steps } }`

### POST `/users/:id/onboarding/complete`
Marca o onboarding como completo.
- **Autenticação**: JWT
- **Parâmetros**: `id` (UUID)
- **Body**: `{ netIncome?, profession? }`
- **Resposta**: `{ success, message }`

### GET `/users/admin/stats`
Retorna estatísticas de usuários (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Resposta**: `{ success, data: { totalUsers, activeUsers, ... } }`

### GET `/admin/users`
Lista todos os usuários com filtros (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Query**: `role?, isActive?`
- **Resposta**: `{ success, data: user[] }`

### GET `/admin/users/:id`
Busca um usuário por ID (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Parâmetros**: `id` (UUID)
- **Resposta**: `{ success, data: user }`

### PUT `/admin/users/:id`
Atualiza um usuário (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Parâmetros**: `id` (UUID)
- **Body**: `{ name?, email?, role?, planType?, ... }`
- **Resposta**: `{ success, data: user }`

### DELETE `/admin/users/:id`
Deleta um usuário (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Parâmetros**: `id` (UUID)
- **Resposta**: `{ success, message }`

### PUT `/admin/users/:id/role`
Altera o role de um usuário (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Parâmetros**: `id` (UUID)
- **Body**: `{ role }`
- **Resposta**: `{ success, data: user }`

---

## Produtos

### GET `/products`
Lista todos os produtos com paginação.
- **Autenticação**: JWT
- **Query**: `skip?, take?`
- **Resposta**: `{ success, data: { items, total } }`

### GET `/products/search`
Busca produtos por termo.
- **Autenticação**: JWT
- **Query**: `q (obrigatório), skip?, take?`
- **Resposta**: `{ success, data: { items, total } }`

### GET `/products/autocomplete`
Autocomplete de produtos (otimizado para busca em tempo real).
- **Autenticação**: JWT
- **Query**: `q (obrigatório), limit?`
- **Resposta**: `{ success, data: product[] }`

### GET `/products/brand`
Lista produtos de uma marca.
- **Autenticação**: JWT
- **Query**: `name (obrigatório), skip?, take?`
- **Resposta**: `{ success, data: { items, total } }`

### GET `/products/category`
Lista produtos de uma categoria.
- **Autenticação**: JWT
- **Query**: `name (obrigatório), skip?, take?`
- **Resposta**: `{ success, data: { items, total } }`

### GET `/products/top`
Lista os top produtos mais comprados.
- **Autenticação**: JWT
- **Query**: `limit?`
- **Resposta**: `{ success, data: product[] }`

---

## Compras

### POST `/users/:userId/purchases`
Registra uma nova compra do usuário.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Body**: `{ type, amount, merchant, description, purchasedAt, items?, paymentMethod?, installments? }`
- **Resposta**: `{ success, data: purchase, historySync }`

### GET `/users/:userId/purchases`
Lista compras do usuário com paginação.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Query**: `type?, page?, limit?`
- **Resposta**: `{ success, data: { items, total, page, limit } }`

### GET `/users/:userId/purchases/summary`
Retorna resumo das compras do usuário.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, data: { totalSpent, averageSpent, ... } }`

### GET `/users/:userId/purchases/trends`
Retorna tendências das compras dos últimos 7 dias.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Query**: `period?`
- **Resposta**: `{ success, data: { trends } }`

### GET `/users/:userId/purchases/balance`
Retorna balanço das compras por tipo e período.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Query**: `startDate?, endDate?, groupBy?`
- **Resposta**: `{ success, data: { balance } }`

### GET `/users/:userId/purchases/stats`
Retorna estatísticas das compras do usuário.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, data: { stats } }`

### GET `/users/:userId/purchases/type-stats`
Retorna estatísticas por tipo de estabelecimento.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Query**: `period?`
- **Resposta**: `{ success, data: { stats } }`

### GET `/users/:userId/purchases/payment-method-stats`
Retorna estatísticas por método de pagamento.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Query**: `startDate?, endDate?`
- **Resposta**: `{ success, data: { stats } }`

### GET `/users/:userId/purchases/future-expenses`
Retorna gastos futuros baseados em parcelas pendentes.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, data: { expenses, totalFutureAmount } }`

### GET `/users/:userId/purchases/:purchaseId`
Retorna uma compra específica.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId, purchaseId` (UUIDs)
- **Resposta**: `{ success, data: purchase }`

### PUT `/users/:userId/purchases/:purchaseId`
Atualiza uma compra e configura parcelamento.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId, purchaseId` (UUIDs)
- **Body**: `{ merchant?, description?, paymentMethod?, installments?, interestRate? }`
- **Resposta**: `{ success, data: purchase }`

### DELETE `/users/:userId/purchases/:purchaseId`
Deleta uma compra e seus itens.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId, purchaseId` (UUIDs)
- **Resposta**: `{ success }`

---

## Preços

### POST `/prices/report`
Reporta o preço de um produto em um mercado.
- **Autenticação**: JWT
- **Body**: `{ productName, category, brand, weight, price, storeName, storeAddress, city, state, zipCode, userLatitude, userLongitude }`
- **Resposta**: `{ success, data: { priceReport } }`

### POST `/prices/report-offer`
Reporta uma oferta rápida de produto.
- **Autenticação**: JWT
- **Body**: `{ productName, price, storeName, unit, quantity, category, latitude, longitude }`
- **Resposta**: `{ success, data: { offer } }`

### GET `/prices/search`
Busca preços de um produto por nome.
- **Autenticação**: Não requerida
- **Query**: `product (obrigatório), latitude?, longitude?, radiusKm?, brand?, weight?, limit?, reportLimit?`
- **Resposta**: `{ success, data: { results } }`

### GET `/prices/suggest`
Retorna sugestões de produtos para autocomplete.
- **Autenticação**: Não requerida
- **Query**: `q (obrigatório), limit?`
- **Resposta**: `{ success, data: suggestions }`

### GET `/prices/nearby`
Retorna preços médios de produtos próximos.
- **Autenticação**: Não requerida
- **Query**: `latitude (obrigatório), longitude (obrigatório), radiusKm?, limit?, product?`
- **Resposta**: `{ success, data: prices, count }`

### GET `/prices/offers`
Busca ofertas próximas com base na média regional.
- **Autenticação**: Não requerida
- **Query**: `latitude (obrigatório), longitude (obrigatório), radiusKm?, product?, minDiscountPercent?, maxResults?`
- **Resposta**: `{ success, data: offers, count }`

---

## Pagamentos

### POST `/payments/pix/generate`
Gera um pagamento PIX no MercadoPago.
- **Autenticação**: Não requerida
- **Body**: `{ amount, orderId, userEmail, userId, planId, description?, payerCpf? }`
- **Resposta**: `{ qrCode, copyKey, paymentId, expiresAt, transactionId, ticketUrl, status }`

### GET `/payments/pix/:paymentId/status`
Consulta o status de um pagamento PIX.
- **Autenticação**: Não requerida
- **Parâmetros**: `paymentId`
- **Resposta**: `{ status, statusDetail, externalReference, transactionAmount, dateApproved, dateCreated }`

### GET `/payments/installments`
Retorna opções de parcelamento para um valor.
- **Autenticação**: Não requerida
- **Query**: `amount (obrigatório), bin?, paymentMethodId?, issuerId?`
- **Resposta**: `{ success, amount, paymentMethodId, installmentOptions, totalOptions }`

### POST `/payments/tokenize-card`
Tokeniza dados do cartão de crédito.
- **Autenticação**: Não requerida
- **Body**: `{ cardNumber, cardExpirationMonth, cardExpirationYear, securityCode, cardholder }`
- **Resposta**: `{ success, token, lastFourDigits }`

### POST `/payments/credit-card/process`
Processa um pagamento por cartão de crédito.
- **Autenticação**: Não requerida
- **Body**: `{ amount, orderId, userEmail, userId, planId, token, paymentMethodId, issuerId, bin, payerCpf, installments, interestRate }`
- **Resposta**: `{ success, paymentId, transactionId, status, message, planType, planExpiresAt }`

---

## Assinaturas

### GET `/subscriptions/test-config`
Testa a configuração do Mercado Pago.
- **Autenticação**: Não requerida
- **Resposta**: `{ success, data: { accessTokenConfigured, publicKeyConfigured, message } }`

### GET `/subscriptions/plans`
Lista os planos disponíveis.
- **Autenticação**: Não requerida
- **Resposta**: `{ plans: plan[] }`

### GET `/subscriptions/status/:userId`
Retorna o status da assinatura do usuário.
- **Autenticação**: JWT
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, data: { planType, planExpiresAt, isActive } }`

### POST `/subscriptions/activate-trial/:userId`
Ativa um trial premium de 10 dias.
- **Autenticação**: JWT
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, message, data: { planType, expiresAt, daysRemaining } }`

### POST `/subscriptions/create/:userId`
Cria uma preferência de pagamento para assinatura.
- **Autenticação**: JWT
- **Parâmetros**: `userId` (UUID)
- **Body**: `{ planId, direction? }`
- **Resposta**: `{ success, data: { publicKey, preferenceId, initPoint, sandboxInitPoint } }`

### POST `/subscriptions/webhook`
Webhook do Mercado Pago para processar pagamentos.
- **Autenticação**: Não requerida
- **Body**: Dados do webhook do MercadoPago
- **Resposta**: `{ received: boolean }`

### GET `/subscriptions/webhook-url`
Retorna a URL do webhook configurada.
- **Autenticação**: Não requerida
- **Resposta**: `{ webhookUrl, apiUrl, appUrl, environment }`

### POST `/subscriptions/webhook/test`
Testa o webhook (apenas desenvolvimento).
- **Autenticação**: Não requerida
- **Resposta**: `{ message, data, note }`

### GET `/subscriptions/payment-status/:userId`
Verifica o status de pagamento do usuário.
- **Autenticação**: JWT
- **Parâmetros**: `userId` (UUID)
- **Resposta**: `{ success, data: { planType, planExpiresAt, isActive, mercadoPagoCustomerId } }`

### POST `/subscriptions/check-payment/:userId`
App verifica se houve mudança no plano (polling).
- **Autenticação**: JWT
- **Parâmetros**: `userId` (UUID)
- **Body**: `{ lastCheck? }`
- **Resposta**: `{ hasUpdate, data? }`

### GET `/subscriptions/payment/success`
Página de sucesso do pagamento.
- **Autenticação**: Não requerida
- **Query**: `userId?, planId?`
- **Resposta**: `{ success, message, redirect, deepLink, data }`

### GET `/subscriptions/payment/failure`
Página de falha do pagamento.
- **Autenticação**: Não requerida
- **Query**: `userId?, planId?`
- **Resposta**: `{ success, message, redirect, deepLink, data }`

### GET `/subscriptions/payment/pending`
Página de pagamento pendente.
- **Autenticação**: Não requerida
- **Query**: `userId?, planId?`
- **Resposta**: `{ success, message, redirect, deepLink, data }`

---

## Notificações

### POST `/notifications/push-token`
Registra/atualiza o token push do usuário.
- **Autenticação**: JWT
- **Body**: `{ token }`
- **Resposta**: `{ success, message }`

---

## Listas de Compras

### POST `/users/:userId/shopping-lists`
Cria uma nova lista de compras.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Body**: `{ name, description?, items? }`
- **Resposta**: `{ success, data: shoppingList }`

### GET `/users/:userId/shopping-lists`
Lista as listas de compras do usuário.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId` (UUID)
- **Query**: `page?, limit?`
- **Resposta**: `{ success, data: { items, total, page, limit } }`

### GET `/users/:userId/shopping-lists/:id`
Retorna uma lista de compras específica.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId, id` (UUIDs)
- **Resposta**: `{ success, data: shoppingList }`

### PATCH `/users/:userId/shopping-lists/:id`
Atualiza uma lista de compras.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId, id` (UUIDs)
- **Body**: `{ name?, description?, items? }`
- **Resposta**: `{ success, data: shoppingList }`

### DELETE `/users/:userId/shopping-lists/:id`
Deleta uma lista de compras.
- **Autenticação**: Não requerida
- **Parâmetros**: `userId, id` (UUIDs)
- **Resposta**: `{ success }`

---

## Tickets

### GET `/user/tickets`
Retorna os tickets do usuário autenticado.
- **Autenticação**: JWT
- **Query**: `page?, limit?, status?`
- **Resposta**: `{ success, data: { items, total } }`

### GET `/user/tickets/:ticketId`
Retorna um ticket específico.
- **Autenticação**: JWT
- **Parâmetros**: `ticketId` (UUID)
- **Resposta**: `{ success, data: ticket }`

### POST `/user/tickets`
Cria um novo ticket de suporte.
- **Autenticação**: JWT
- **Body**: `{ subject, category, priority, description }`
- **Resposta**: `{ success, data: ticket }`

### POST `/user/tickets/:ticketId/messages`
Adiciona uma mensagem a um ticket.
- **Autenticação**: JWT
- **Parâmetros**: `ticketId` (UUID)
- **Body**: `{ message }`
- **Resposta**: `{ success, message }`

---

## Relatórios

### POST `/admin/reports/generate`
Gera um novo relatório (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Body**: `{ type, period }`
- **Resposta**: `{ success, data: { id, type, period, status, downloadUrl } }`

### GET `/admin/reports/data`
Busca dados para preview do relatório (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Query**: `type (obrigatório), period (obrigatório)`
- **Resposta**: `{ success, data: reportData }`

### GET `/admin/reports/recent`
Lista relatórios gerados recentemente (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Query**: `limit?`
- **Resposta**: `{ success, data: reports[] }`

---

## OCR

### POST `/ocr/extract-base64`
Extrai dados de imagem em base64.
- **Autenticação**: JWT
- **Body**: `{ image (obrigatório), language?, includeTextOverlay? }`
- **Resposta**: `{ ParsedResults, extractedData }`

### POST `/ocr/extract-receipt-base64`
Extrai dados de nota fiscal/cupom.
- **Autenticação**: JWT
- **Body**: `{ image?, file?, language?, includeTextOverlay? }`
- **Resposta**: `{ success, data: receiptData }`

### POST `/ocr/receipt-from-url`
Extrai dados de nota fiscal via URL do QR Code.
- **Autenticação**: JWT
- **Body**: `{ url (obrigatório) }`
- **Resposta**: `{ success, data: receiptData }`

### GET `/ocr/queue-status`
Retorna o status detalhado da fila OCR.
- **Autenticação**: JWT
- **Resposta**: `{ queueLength, processing, maxConcurrent, stats, health }`

### GET `/ocr/scan-limit`
Retorna informações sobre limite de scans.
- **Autenticação**: JWT
- **Resposta**: `{ used, limit, remaining }`

### POST `/ocr/queue-clear`
Limpa a fila OCR (emergência).
- **Autenticação**: JWT
- **Resposta**: `{ mainQueue, waitingQueue, message }`

---

## Scanner

### POST `/scanner/receive`
Recebe código de barras do app mobile.
- **Autenticação**: Não requerida
- **Body**: `{ barcode, timestamp }`
- **Resposta**: `{ success, barcode, timestamp, product }`

### GET `/scanner/product`
Busca produto por código de barras.
- **Autenticação**: Não requerida
- **Query**: `barcode (obrigatório)`
- **Resposta**: `{ product }`

### GET `/scanner/last`
Retorna o último código escaneado (para polling).
- **Autenticação**: Não requerida
- **Resposta**: `{ barcode, timestamp }`

### GET `/scanner/debug/barcodes`
Debug: lista barcodes cadastrados.
- **Autenticação**: Não requerida
- **Resposta**: `{ count, barcodes }`

### GET `/scanner/debug/barcode-exists`
Debug: verifica se barcode existe.
- **Autenticação**: Não requerida
- **Query**: `barcode (obrigatório)`
- **Resposta**: `{ inputBarcode, normalizedInput, exactMatch, likeMatch, message }`

---

## Logs

### GET `/logs/my-logs`
Retorna os logs do usuário autenticado.
- **Autenticação**: JWT
- **Query**: `page?, limit?, action?, level?`
- **Resposta**: `{ success, data: logs[] }`

### GET `/logs/user/:userId`
Retorna logs de um usuário específico (SUPPORT/ADMIN).
- **Autenticação**: JWT (Support/Admin)
- **Parâmetros**: `userId` (UUID)
- **Query**: `page?, limit?, action?, level?`
- **Resposta**: `{ success, data: logs[] }`

### GET `/logs`
Retorna todos os logs do sistema (ADMIN ONLY).
- **Autenticação**: JWT (Admin)
- **Query**: `page?, limit?, userId?, action?, level?`
- **Resposta**: `{ success, data: logs[] }`

---

## Email

### GET `/email/verify`
Verifica a conexão SMTP.
- **Autenticação**: Não requerida
- **Resposta**: `{ success, message }`

### POST `/email/test`
Envia um email de teste.
- **Autenticação**: Não requerida
- **Body**: `{ to, subject, message }`
- **Resposta**: `{ success, message }`

### POST `/email/custom`
Envia um email customizado.
- **Autenticação**: Não requerida
- **Body**: `{ to, subject, html }`
- **Resposta**: `{ success, message }`

---

## App

### GET `/`
Retorna mensagem de boas-vindas.
- **Autenticação**: Não requerida
- **Resposta**: `{ message, version, status }`

### GET `/health`
Verifica o status da aplicação.
- **Autenticação**: Não requerida
- **Resposta**: `{ status, timestamp }`

---

## Notas Gerais

- **Autenticação JWT**: Usar header `Authorization: Bearer <token>`
- **Roles**: USER, ADMIN, SUPER_ADMIN, SUPPORT
- **Formato de Data**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Paginação**: `page` (padrão: 1), `limit` (padrão: 20)
- **Códigos de Status HTTP**:
  - 200: OK
  - 201: Created
  - 204: No Content
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 409: Conflict
  - 500: Internal Server Error
  - 503: Service Unavailable
