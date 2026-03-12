# Phase 3 Business Logic - Quick Reference

## Sales Service

### calculateDiscount
```typescript
async calculateDiscount(id: string, discountPercentage: number): Promise<SaleResponseDto>
```
- **Purpose**: Apply discount to sale
- **Parameters**: Sale ID, discount percentage (0-100)
- **Returns**: Updated sale with new total amount
- **Events**: SaleUpdated
- **Errors**: NOT_FOUND, BAD_REQUEST

### updateSaleStatus
```typescript
async updateSaleStatus(id: string, newStatus: SaleStatus): Promise<SaleResponseDto>
```
- **Purpose**: Update sale status with validation
- **Parameters**: Sale ID, new status
- **Returns**: Updated sale
- **Events**: SaleUpdated
- **Errors**: NOT_FOUND, BAD_REQUEST
- **Valid Transitions**:
  - PENDING → CONFIRMED, CANCELLED
  - CONFIRMED → PROCESSING, CANCELLED
  - PROCESSING → COMPLETED, FAILED
  - COMPLETED → REFUNDED
  - FAILED → PENDING

---

## Inventory Service

### checkStockLevels
```typescript
async checkStockLevels(itemId: string): Promise<{
  isLowStock: boolean;
  quantity: number;
  minQuantity: number;
}>
```
- **Purpose**: Check if item is low on stock
- **Parameters**: Item ID
- **Returns**: Stock status object
- **Events**: LowStockAlert (if low)
- **Errors**: NOT_FOUND

### checkReorderPoints
```typescript
async checkReorderPoints(): Promise<Array<{
  id: string;
  productId: string;
  currentQuantity: number;
  reorderQuantity: number;
  minQuantity: number;
  maxQuantity: number;
}>>
```
- **Purpose**: Find all items needing reorder
- **Parameters**: None
- **Returns**: Array of items to reorder
- **Events**: LowStockAlert (for each item)
- **Errors**: None

---

## Payments Service

### handleWebhook
```typescript
async handleWebhook(data: any, signature?: string): Promise<void>
```
- **Purpose**: Process MercadoPago webhook
- **Parameters**: Webhook data, optional signature
- **Returns**: Void
- **Events**: PaymentCompleted, PaymentFailed
- **Errors**: UNAUTHORIZED, BAD_REQUEST, NOT_FOUND
- **Status Mapping**:
  - approved → COMPLETED
  - pending → PROCESSING
  - rejected → FAILED
  - cancelled → CANCELLED
  - refunded → REFUNDED

### refundPaymentWithReason
```typescript
async refundPaymentWithReason(id: string, reason: string): Promise<PaymentResponseDto>
```
- **Purpose**: Refund completed payment with reason
- **Parameters**: Payment ID, refund reason
- **Returns**: Updated payment
- **Events**: PaymentRefunded
- **Errors**: NOT_FOUND, BAD_REQUEST

---

## Fiscal Service

### signNfceXml
```typescript
async signNfceXml(id: string, certificatePath: string): Promise<NfceResponseDto>
```
- **Purpose**: Sign NFC-e XML with certificate
- **Parameters**: NFC-e ID, certificate path
- **Returns**: Updated NFC-e
- **Status**: PENDING → PROCESSING
- **Errors**: NOT_FOUND, BAD_REQUEST

### authorizeNfce
```typescript
async authorizeNfce(id: string): Promise<NfceResponseDto>
```
- **Purpose**: Send signed NFC-e to SEFAZ for authorization
- **Parameters**: NFC-e ID
- **Returns**: Updated NFC-e with protocol and auth code
- **Status**: PROCESSING → AUTHORIZED (or FAILED)
- **Events**: NfceIssued (success), NfceFailed (failure)
- **Errors**: NOT_FOUND, BAD_REQUEST

### cancelNfce
```typescript
async cancelNfce(id: string, justification: string): Promise<NfceResponseDto>
```
- **Purpose**: Cancel authorized NFC-e
- **Parameters**: NFC-e ID, cancellation justification
- **Returns**: Updated NFC-e
- **Status**: AUTHORIZED → CANCELLED
- **Events**: NfceCancelled
- **Errors**: NOT_FOUND, BAD_REQUEST

---

## Usage Examples

### Sales - Apply Discount
```typescript
// Apply 10% discount to sale
const updatedSale = await salesService.calculateDiscount('sale-123', 10);
// totalAmount reduced by 10%, discountApplied = 10
```

### Sales - Update Status
```typescript
// Move sale from PENDING to CONFIRMED
const updatedSale = await salesService.updateSaleStatus('sale-123', SaleStatus.CONFIRMED);
```

### Inventory - Check Stock
```typescript
// Check if item is low on stock
const stockStatus = await inventoryService.checkStockLevels('item-123');
if (stockStatus.isLowStock) {
  // Handle low stock
}
```

### Inventory - Reorder Check
```typescript
// Get all items needing reorder
const reorderItems = await inventoryService.checkReorderPoints();
// Process reorder requests
```

### Payments - Handle Webhook
```typescript
// Process MercadoPago webhook
await paymentsService.handleWebhook(webhookData, signature);
// Payment status automatically updated
```

### Payments - Refund
```typescript
// Refund payment with reason
const refundedPayment = await paymentsService.refundPaymentWithReason(
  'payment-123',
  'Customer requested refund'
);
```

### Fiscal - Sign & Authorize
```typescript
// Sign NFC-e XML
const signedNfce = await fiscalService.signNfceXml('nfce-123', '/path/to/cert.pfx');

// Authorize with SEFAZ
const authorizedNfce = await fiscalService.authorizeNfce('nfce-123');
// Now has protocolNumber and authorizationCode
```

### Fiscal - Cancel
```typescript
// Cancel authorized NFC-e
const cancelledNfce = await fiscalService.cancelNfce(
  'nfce-123',
  'Cancelamento por erro'
);
```

---

## Event Publishing

All methods publish Kafka events for downstream services:

### Sales Events
- `SaleUpdated`: When discount applied or status changed

### Inventory Events
- `LowStockAlert`: When stock below minimum

### Payments Events
- `PaymentCompleted`: When webhook confirms approval
- `PaymentFailed`: When webhook confirms failure
- `PaymentRefunded`: When refund processed

### Fiscal Events
- `NfceIssued`: When NFC-e authorized
- `NfceFailed`: When authorization fails
- `NfceCancelled`: When NFC-e cancelled

---

## Error Handling

All methods follow consistent error handling:

```typescript
try {
  // Business logic
} catch (error) {
  throw new HttpException(
    `Descriptive error message: ${error.message}`,
    HttpStatus.BAD_REQUEST // or NOT_FOUND, UNAUTHORIZED
  );
}
```

---

## Testing

Run unit tests for each service:

```bash
# Sales
npm test -- services/sales/src/sales/sales.service.spec.ts

# Inventory
npm test -- services/inventory/src/inventory/inventory.service.spec.ts

# Payments
npm test -- services/payments/src/payments/payments.service.spec.ts

# Fiscal
npm test -- services/fiscal/src/fiscal/fiscal.service.spec.ts
```

---

## Integration Points

### Sales ↔ Inventory
- Sales creation may trigger inventory checks
- Discount application affects order value

### Sales ↔ Payments
- Sale status changes trigger payment processing
- Payment completion updates sale status

### Payments ↔ Fiscal
- Payment completion triggers NFC-e generation
- NFC-e authorization confirms payment

### All Services
- Kafka events enable asynchronous communication
- Event consumers handle cross-service workflows
