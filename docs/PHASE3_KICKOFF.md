# Phase 3 Kickoff - Features Implementation

**Status**: Ready to Start  
**Date**: March 12, 2026  
**Estimated Duration**: 1-2 weeks  
**Estimated Effort**: 15-20 hours

---

## 🎯 PHASE 3 OBJECTIVES

### 1. Business Logic Implementation (8-10 hours)
Implementar lógica de negócio avançada em cada serviço

### 2. Business Validations (4-6 hours)
Adicionar validações e regras de negócio

### 3. E2E Tests (3-4 hours)
Criar testes end-to-end para fluxos completos

---

## 📋 DETAILED TASKS

### SALES SERVICE

#### Task 1: Discount Calculation
**File**: `services/sales/src/sales/sales.service.ts`

```typescript
// Adicionar método para calcular desconto
async calculateDiscount(saleId: string, discountPercentage: number): Promise<void> {
  const sale = await this.saleRepository.findOne({ where: { id: saleId } });
  
  if (!sale) {
    throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
  }
  
  const discountAmount = (sale.totalAmount * discountPercentage) / 100;
  sale.discountAmount = discountAmount;
  sale.finalAmount = sale.totalAmount - discountAmount;
  
  await this.saleRepository.save(sale);
}
```

**Tests**: 
- Test discount calculation
- Test with different percentages
- Test edge cases (0%, 100%)

#### Task 2: Order Status Workflow
**File**: `services/sales/src/sales/sales.service.ts`

```typescript
// Adicionar workflow de status
async updateSaleStatus(saleId: string, newStatus: SaleStatus): Promise<void> {
  const sale = await this.saleRepository.findOne({ where: { id: saleId } });
  
  if (!sale) {
    throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
  }
  
  // Validar transição de status
  if (!this.isValidStatusTransition(sale.status, newStatus)) {
    throw new HttpException('Invalid status transition', HttpStatus.BAD_REQUEST);
  }
  
  sale.status = newStatus;
  await this.saleRepository.save(sale);
  
  // Publicar evento
  await this.saleProducer.publishStatusChanged({
    saleId: sale.id,
    oldStatus: sale.status,
    newStatus: newStatus,
  });
}

private isValidStatusTransition(from: SaleStatus, to: SaleStatus): boolean {
  const validTransitions = {
    [SaleStatus.PENDING]: [SaleStatus.CONFIRMED, SaleStatus.CANCELLED],
    [SaleStatus.CONFIRMED]: [SaleStatus.SHIPPED, SaleStatus.CANCELLED],
    [SaleStatus.SHIPPED]: [SaleStatus.DELIVERED, SaleStatus.RETURNED],
    [SaleStatus.DELIVERED]: [SaleStatus.RETURNED],
    [SaleStatus.CANCELLED]: [],
    [SaleStatus.RETURNED]: [],
  };
  
  return validTransitions[from]?.includes(to) ?? false;
}
```

---

### INVENTORY SERVICE

#### Task 1: Stock Alerts
**File**: `services/inventory/src/inventory/inventory.service.ts`

```typescript
// Adicionar alertas de estoque
async checkStockLevels(itemId: string): Promise<void> {
  const item = await this.itemRepository.findOne({ where: { id: itemId } });
  
  if (!item) {
    throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
  }
  
  // Alerta de estoque baixo
  if (item.quantity < item.minQuantity) {
    await this.inventoryProducer.publishLowStockAlert({
      itemId: item.id,
      productId: item.productId,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
    });
  }
  
  // Alerta de estoque crítico
  if (item.quantity === 0) {
    await this.inventoryProducer.publishOutOfStock({
      itemId: item.id,
      productId: item.productId,
    });
  }
}
```

#### Task 2: Reorder Point Logic
**File**: `services/inventory/src/inventory/inventory.service.ts`

```typescript
// Adicionar lógica de ponto de reorder
async checkReorderPoints(): Promise<void> {
  const items = await this.itemRepository.find();
  
  for (const item of items) {
    if (item.quantity <= item.minQuantity) {
      // Criar ordem de recompra automaticamente
      await this.createReorderRequest({
        itemId: item.id,
        productId: item.productId,
        quantity: item.maxQuantity - item.quantity,
      });
    }
  }
}
```

---

### PAYMENTS SERVICE

#### Task 1: Webhook Validation
**File**: `services/payments/src/payments/payments.service.ts`

```typescript
// Adicionar validação de webhook
async handleWebhook(data: any, signature: string): Promise<void> {
  // Validar assinatura
  const isValid = this.validateWebhookSignature(data, signature);
  
  if (!isValid) {
    throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
  }
  
  // Processar webhook
  const payment = await this.paymentRepository.findOne({
    where: { externalId: data.id },
  });
  
  if (!payment) {
    throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
  }
  
  // Atualizar status
  payment.status = this.mapExternalStatus(data.status);
  await this.paymentRepository.save(payment);
}

private validateWebhookSignature(data: any, signature: string): boolean {
  // Implementar validação de assinatura
  // Usar HMAC-SHA256 com secret key
  return true; // TODO: Implementar
}
```

#### Task 2: Refund Logic
**File**: `services/payments/src/payments/payments.service.ts`

```typescript
// Adicionar lógica de reembolso
async refundPayment(paymentId: string, reason: string): Promise<void> {
  const payment = await this.paymentRepository.findOne({
    where: { id: paymentId },
  });
  
  if (!payment) {
    throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
  }
  
  if (payment.status !== PaymentStatus.COMPLETED) {
    throw new HttpException(
      'Only completed payments can be refunded',
      HttpStatus.BAD_REQUEST,
    );
  }
  
  // Processar reembolso
  await this.mercadopagoService.refundPayment(payment.externalId);
  
  // Atualizar status
  payment.status = PaymentStatus.REFUNDED;
  payment.refundReason = reason;
  payment.refundedAt = new Date();
  
  await this.paymentRepository.save(payment);
  
  // Publicar evento
  await this.paymentsProducer.publishPaymentRefunded({
    paymentId: payment.id,
    orderId: payment.orderId,
    amount: payment.amount,
    reason: reason,
  });
}
```

---

### FISCAL SERVICE

#### Task 1: XML Signing
**File**: `services/fiscal/src/fiscal/fiscal.service.ts`

```typescript
// Adicionar assinatura de XML
async signNfceXml(nfceId: string, certificatePath: string): Promise<string> {
  const nfce = await this.nfceRepository.findOne({ where: { id: nfceId } });
  
  if (!nfce) {
    throw new HttpException('NFC-e not found', HttpStatus.NOT_FOUND);
  }
  
  // Carregar certificado
  const certificate = await this.loadCertificate(certificatePath);
  
  // Assinar XML
  const signedXml = await this.xmlSignerService.signXml(
    nfce.xmlContent,
    certificate,
  );
  
  // Atualizar NFC-e
  nfce.xmlContent = signedXml;
  nfce.status = NfceStatus.SIGNED;
  
  await this.nfceRepository.save(nfce);
  
  return signedXml;
}

private async loadCertificate(certificatePath: string): Promise<any> {
  // Implementar carregamento de certificado
  // Usar biblioteca de certificados
  return null; // TODO: Implementar
}
```

#### Task 2: NFC-e Cancellation Workflow
**File**: `services/fiscal/src/fiscal/fiscal.service.ts`

```typescript
// Adicionar workflow de cancelamento
async cancelNfce(nfceId: string, justification: string): Promise<void> {
  const nfce = await this.nfceRepository.findOne({ where: { id: nfceId } });
  
  if (!nfce) {
    throw new HttpException('NFC-e not found', HttpStatus.NOT_FOUND);
  }
  
  if (nfce.status !== NfceStatus.AUTHORIZED) {
    throw new HttpException(
      'Only authorized NFC-es can be cancelled',
      HttpStatus.BAD_REQUEST,
    );
  }
  
  // Cancelar na SEFAZ
  await this.sefazService.cancelNfce(nfce.protocolNumber, justification);
  
  // Atualizar status
  nfce.status = NfceStatus.CANCELLED;
  nfce.cancellationJustification = justification;
  nfce.cancelledAt = new Date();
  
  await this.nfceRepository.save(nfce);
  
  // Publicar evento
  await this.fiscalProducer.publishNfceCancelled({
    nfceId: nfce.id,
    protocolNumber: nfce.protocolNumber,
    justification: justification,
  });
}
```

---

## 🧪 E2E TEST EXAMPLE

**File**: `test/e2e/complete-sales-flow.e2e-spec.ts`

```typescript
describe('Complete Sales Flow E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        SalesModule,
        InventoryModule,
        PaymentsModule,
        DeliveryModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should complete full sales workflow', async () => {
    // 1. Create sale
    const saleResponse = await request(app.getHttpServer())
      .post('/api/sales')
      .set('Authorization', 'Bearer test-token')
      .send({
        customerId: 'customer-123',
        items: [{ productId: 'prod-1', quantity: 2, unitPrice: 50 }],
        totalAmount: 100,
      })
      .expect(201);

    const saleId = saleResponse.body.id;

    // 2. Apply discount
    await request(app.getHttpServer())
      .post(`/api/sales/${saleId}/discount`)
      .set('Authorization', 'Bearer test-token')
      .send({ discountPercentage: 10 })
      .expect(200);

    // 3. Process payment
    const paymentResponse = await request(app.getHttpServer())
      .post('/api/payments')
      .set('Authorization', 'Bearer test-token')
      .send({
        orderId: saleId,
        amount: 90,
        paymentMethod: 'credit_card',
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      })
      .expect(201);

    // 4. Update inventory
    await request(app.getHttpServer())
      .put('/api/inventory/prod-1')
      .set('Authorization', 'Bearer test-token')
      .send({ quantity: 98 })
      .expect(200);

    // 5. Create delivery
    const deliveryResponse = await request(app.getHttpServer())
      .post('/api/deliveries')
      .set('Authorization', 'Bearer test-token')
      .send({
        saleId: saleId,
        estimatedDate: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(201);

    // 6. Verify all steps completed
    expect(saleResponse.body.status).toBe('PENDING');
    expect(paymentResponse.body.status).toBe('COMPLETED');
    expect(deliveryResponse.body.status).toBe('PENDING');
  });
});
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Sales Service
- [ ] Implement discount calculation
- [ ] Implement order status workflow
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests

### Inventory Service
- [ ] Implement stock alerts
- [ ] Implement reorder point logic
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests

### Payments Service
- [ ] Implement webhook validation
- [ ] Implement refund logic
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests

### Fiscal Service
- [ ] Implement XML signing
- [ ] Implement NFC-e cancellation
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add E2E tests

### Other Services
- [ ] Delivery: Tracking updates
- [ ] Suppliers: Order management
- [ ] Offers: Expiration logic
- [ ] OCR: Document classification

---

## 🚀 HOW TO START

### Step 1: Choose a Service
Start with Sales service (most critical)

### Step 2: Implement Business Logic
Follow the examples above

### Step 3: Add Tests
Add unit tests for new logic

### Step 4: Add Integration Tests
Test with other services

### Step 5: Add E2E Tests
Test complete workflows

### Step 6: Document
Update documentation

---

## 📊 ESTIMATED TIMELINE

```
Day 1-2: Sales Service (Discount + Status)
Day 3-4: Inventory Service (Alerts + Reorder)
Day 5-6: Payments Service (Webhook + Refund)
Day 7-8: Fiscal Service (Signing + Cancellation)
Day 9-10: E2E Tests + Documentation
```

---

## 💡 TIPS

1. **Start Simple**: Implement basic logic first
2. **Test as You Go**: Add tests for each feature
3. **Use Kafka**: Publish events for other services
4. **Document**: Keep documentation updated
5. **Review**: Get code review before merging

---

## 🎯 SUCCESS CRITERIA

- [ ] All business logic implemented
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] Code coverage > 80%
- [ ] Documentation complete
- [ ] Ready for Phase 4

---

**Ready to start Phase 3?** 🚀

