# Phase 3 - Remaining Items Roadmap

**Current Status**: Item 1 Complete ✅  
**Next**: Item 2 (Business Validations)  
**Estimated Time**: 7-10 hours remaining

---

## Phase 3 Overview

| Item | Task | Status | Est. Time | Priority |
|------|------|--------|-----------|----------|
| 1 | Business Logic Implementation | ✅ COMPLETE | 2h | P0 |
| 2 | Business Validations | ⏳ NEXT | 4-6h | P0 |
| 3 | E2E Tests | ⏳ PENDING | 3-4h | P1 |

---

## Item 2: Business Validations (4-6 hours)

### Overview
Implement comprehensive validation layer for all business logic with DTOs, custom validators, and cross-service validation rules.

### Tasks

#### 2.1 Sales Service Validations (1 hour)
**File**: `services/sales/src/sales/dto/`

Create validation DTOs:
```typescript
// validate-discount.dto.ts
export class ValidateDiscountDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @IsUUID()
  saleId: string;
}

// validate-status-transition.dto.ts
export class ValidateStatusTransitionDto {
  @IsEnum(SaleStatus)
  currentStatus: SaleStatus;

  @IsEnum(SaleStatus)
  newStatus: SaleStatus;
}
```

Add validation methods:
- `validateDiscountApplicable(saleId)` - Check if sale can receive discount
- `validateStatusTransition(from, to)` - Validate state machine
- `validateSaleAmount(amount)` - Minimum/maximum amount checks

#### 2.2 Inventory Service Validations (1 hour)
**File**: `services/inventory/src/inventory/dto/`

Create validation DTOs:
```typescript
// validate-stock-levels.dto.ts
export class ValidateStockLevelsDto {
  @IsUUID()
  itemId: string;

  @IsNumber()
  @Min(0)
  requestedQuantity: number;
}

// validate-reorder.dto.ts
export class ValidateReorderDto {
  @IsNumber()
  @Min(0)
  minQuantity: number;

  @IsNumber()
  @Min(0)
  maxQuantity: number;

  @IsNumber()
  @Min(0)
  currentQuantity: number;
}
```

Add validation methods:
- `validateStockAvailable(itemId, quantity)` - Check if quantity available
- `validateReorderConfig(min, max, current)` - Validate reorder settings
- `validateMinMaxRatio()` - Ensure min < max

#### 2.3 Payments Service Validations (1 hour)
**File**: `services/payments/src/payments/dto/`

Create validation DTOs:
```typescript
// validate-refund.dto.ts
export class ValidateRefundDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  @MinLength(10)
  reason: string;

  @IsNumber()
  @Min(0)
  refundAmount?: number;
}

// validate-webhook.dto.ts
export class ValidateWebhookDto {
  @IsString()
  signature: string;

  @IsObject()
  data: any;

  @IsString()
  timestamp: string;
}
```

Add validation methods:
- `validateRefundAmount(paymentAmount, refundAmount)` - Partial refund validation
- `validateWebhookTimestamp(timestamp)` - Prevent replay attacks
- `validatePaymentStatus(status)` - Ensure valid status

#### 2.4 Fiscal Service Validations (1 hour)
**File**: `services/fiscal/src/fiscal/dto/`

Create validation DTOs:
```typescript
// validate-nfce-signing.dto.ts
export class ValidateNfceSigningDto {
  @IsUUID()
  nfceId: string;

  @IsString()
  certificatePath: string;

  @IsString()
  certificatePassword?: string;
}

// validate-nfce-cancellation.dto.ts
export class ValidateNfceCancellationDto {
  @IsUUID()
  nfceId: string;

  @IsString()
  @MinLength(15)
  justification: string;

  @IsString()
  cancelledBy: string;
}
```

Add validation methods:
- `validateCertificate(path)` - Check certificate validity
- `validateNfceStatus(status)` - Ensure can be signed/cancelled
- `validateCancellationReason(reason)` - Validate reason format

#### 2.5 Cross-Service Validations (1 hour)
**File**: `services/*/src/common/validators/`

Create cross-service validators:
```typescript
// sales-inventory-validator.ts
export class SalesInventoryValidator {
  async validateInventoryForSale(saleItems: SaleItem[]): Promise<boolean> {
    // Check inventory service for stock availability
  }
}

// sales-payments-validator.ts
export class SalesPaymentsValidator {
  async validatePaymentForSale(saleId: string, amount: number): Promise<boolean> {
    // Validate payment can be processed for sale
  }
}

// payments-fiscal-validator.ts
export class PaymentsFiscalValidator {
  async validateNfceForPayment(paymentId: string): Promise<boolean> {
    // Validate NFC-e can be issued for payment
  }
}
```

### Deliverables
- ✅ Validation DTOs for all services
- ✅ Custom validators
- ✅ Cross-service validation
- ✅ Unit tests for validators
- ✅ Integration tests for validation flows

---

## Item 3: E2E Tests (3-4 hours)

### Overview
Create end-to-end tests that validate complete workflows across multiple services.

### Test Scenarios

#### 3.1 Complete Sales Flow (1 hour)
**File**: `test/e2e/sales-complete-flow.e2e.spec.ts`

```typescript
describe('Complete Sales Flow', () => {
  it('should complete full sales workflow', async () => {
    // 1. Create sale
    const sale = await createSale({...});
    
    // 2. Apply discount
    const discountedSale = await applySaleDiscount(sale.id, 10);
    
    // 3. Update status to CONFIRMED
    const confirmedSale = await updateSaleStatus(sale.id, 'CONFIRMED');
    
    // 4. Process payment
    const payment = await processPayment({...});
    
    // 5. Update sale to PROCESSING
    const processingSale = await updateSaleStatus(sale.id, 'PROCESSING');
    
    // 6. Generate NFC-e
    const nfce = await generateNfce({...});
    
    // 7. Sign NFC-e
    const signedNfce = await signNfceXml(nfce.id, certPath);
    
    // 8. Authorize NFC-e
    const authorizedNfce = await authorizeNfce(nfce.id);
    
    // 9. Complete sale
    const completedSale = await updateSaleStatus(sale.id, 'COMPLETED');
    
    // Verify all events published
    expect(kafkaEvents).toContain('SaleCreated');
    expect(kafkaEvents).toContain('SaleUpdated');
    expect(kafkaEvents).toContain('PaymentCompleted');
    expect(kafkaEvents).toContain('NfceIssued');
  });
});
```

#### 3.2 Inventory Reorder Flow (1 hour)
**File**: `test/e2e/inventory-reorder-flow.e2e.spec.ts`

```typescript
describe('Inventory Reorder Flow', () => {
  it('should trigger reorder when stock low', async () => {
    // 1. Create inventory item
    const item = await createInventoryItem({
      quantity: 100,
      minQuantity: 20,
      maxQuantity: 500
    });
    
    // 2. Reduce quantity below minimum
    await updateInventoryItem(item.id, { quantity: 15 });
    
    // 3. Check stock levels
    const stockStatus = await checkStockLevels(item.id);
    expect(stockStatus.isLowStock).toBe(true);
    
    // 4. Check reorder points
    const reorderItems = await checkReorderPoints();
    expect(reorderItems).toContainEqual(
      expect.objectContaining({ id: item.id })
    );
    
    // 5. Verify LowStockAlert event published
    expect(kafkaEvents).toContain('LowStockAlert');
  });
});
```

#### 3.3 Payment Webhook Flow (1 hour)
**File**: `test/e2e/payment-webhook-flow.e2e.spec.ts`

```typescript
describe('Payment Webhook Flow', () => {
  it('should handle payment webhook correctly', async () => {
    // 1. Create payment
    const payment = await processPayment({...});
    expect(payment.status).toBe('PROCESSING');
    
    // 2. Simulate webhook from MercadoPago
    const webhookData = {
      id: payment.externalId,
      status: 'approved',
      external_reference: payment.orderId
    };
    
    // 3. Handle webhook
    await handleWebhook(webhookData);
    
    // 4. Verify payment status updated
    const updatedPayment = await getPaymentById(payment.id);
    expect(updatedPayment.status).toBe('COMPLETED');
    
    // 5. Verify PaymentCompleted event published
    expect(kafkaEvents).toContain('PaymentCompleted');
  });
  
  it('should handle refund webhook', async () => {
    // 1. Create and complete payment
    const payment = await processPayment({...});
    await handleWebhook({ id: payment.externalId, status: 'approved' });
    
    // 2. Refund payment
    const refundedPayment = await refundPaymentWithReason(
      payment.id,
      'Customer requested'
    );
    expect(refundedPayment.status).toBe('REFUNDED');
    
    // 3. Verify PaymentRefunded event published
    expect(kafkaEvents).toContain('PaymentRefunded');
  });
});
```

#### 3.4 NFC-e Authorization Flow (1 hour)
**File**: `test/e2e/nfce-authorization-flow.e2e.spec.ts`

```typescript
describe('NFC-e Authorization Flow', () => {
  it('should complete NFC-e authorization workflow', async () => {
    // 1. Generate NFC-e
    const nfce = await generateNfce({...});
    expect(nfce.status).toBe('AUTHORIZED'); // Auto-authorized in generateNfce
    
    // 2. Verify NfceIssued event published
    expect(kafkaEvents).toContain('NfceIssued');
  });
  
  it('should handle NFC-e cancellation', async () => {
    // 1. Generate and authorize NFC-e
    const nfce = await generateNfce({...});
    
    // 2. Cancel NFC-e
    const cancelledNfce = await cancelNfce(
      nfce.id,
      'Cancelamento por erro'
    );
    expect(cancelledNfce.status).toBe('CANCELLED');
    
    // 3. Verify NfceCancelled event published
    expect(kafkaEvents).toContain('NfceCancelled');
  });
});
```

### Deliverables
- ✅ 4 E2E test files
- ✅ Complete workflow coverage
- ✅ Event verification
- ✅ Error scenario testing
- ✅ Cross-service integration testing

---

## Implementation Order

### Week 1 (Phase 3 Item 2)
- Day 1: Sales & Inventory validations
- Day 2: Payments & Fiscal validations
- Day 3: Cross-service validations
- Day 4: Validation tests

### Week 2 (Phase 3 Item 3)
- Day 1: Sales flow E2E tests
- Day 2: Inventory flow E2E tests
- Day 3: Payment flow E2E tests
- Day 4: NFC-e flow E2E tests

---

## Success Criteria

### Item 2 (Validations)
- ✅ All validation DTOs created
- ✅ Custom validators implemented
- ✅ Cross-service validators working
- ✅ 100% test coverage for validators
- ✅ No compilation errors

### Item 3 (E2E Tests)
- ✅ 4 E2E test files created
- ✅ All workflows tested end-to-end
- ✅ Event propagation verified
- ✅ Error scenarios covered
- ✅ All tests passing

---

## Project Status After Phase 3

```
Phase 1 (Fundação)    ████████████████████ 100% ✅
Phase 2 (Qualidade)   ████████████████████ 100% ✅
Phase 3 (Features)    ████████████████████ 100% ✅
Phase 4 (Polish)      ░░░░░░░░░░░░░░░░░░░░   0% ⏳

Overall: 95% Complete
```

---

## Notes

- All code follows NestJS best practices
- Comprehensive error handling required
- Event publishing must be verified
- Cross-service communication via Kafka
- Database transactions for consistency
- Proper logging for debugging

---

## Ready to Start?

Phase 3 Item 1 is complete. Ready to begin Item 2 (Business Validations)?

**Next Command**: `continua` to start Item 2
