# OCR Integration Flow - Fluxo Completo

## Visão Geral

O fluxo de integração OCR agora funciona em **duas etapas**:

1. **Primeira Saída**: Enviar imagem para OCR e receber dados extraídos
2. **Segunda Saída**: Usar os dados extraídos para criar a compra

## Fluxo Detalhado

### Etapa 1: Extrair Dados da Imagem com OCR

**Endpoint**: `POST /api/monolith/ocr/extract-base64`

**Payload**:
```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "documentType": "receipt",
  "language": "por"
}
```

**Campos**:
- `image` ou `imageBase64`: String base64 da imagem (com ou sem prefixo `data:image/...;base64,`)
- `documentType`: Tipo de documento (`receipt`, `nfce`, `invoice`) - padrão: `receipt`
- `language`: Idioma (`por`, `eng`, `por+eng`) - padrão: `por`

**Resposta**:
```json
{
  "text": "Texto extraído da imagem...",
  "extractedData": {
    "total": 150.50,
    "date": "14/03/2026",
    "cnpj": "12.345.678/0001-90"
  },
  "confidence": 0.95,
  "documentType": "receipt"
}
```

### Etapa 2: Criar Compra com Dados do OCR

**Endpoint**: `POST /api/users/:userId/purchases`

**Payload**:
```json
{
  "type": "market",
  "merchant": "Supermercado XYZ",
  "description": "Compra no supermercado",
  "amount": 150.50,
  "paymentMethod": "credit_card",
  "purchasedAt": "2026-03-14T21:47:27.683Z",
  "items": [
    {
      "name": "Produto 1",
      "quantity": 2,
      "unit": "un",
      "unitPrice": 50.25
    }
  ],
  "ocrData": {
    "text": "Texto extraído da imagem...",
    "extractedData": {
      "total": 150.50,
      "date": "14/03/2026",
      "cnpj": "12.345.678/0001-90"
    },
    "confidence": 0.95,
    "documentType": "receipt"
  }
}
```

**Resposta**:
```json
{
  "id": "uuid-da-compra",
  "userId": "uuid-do-usuario",
  "type": "market",
  "merchant": "Supermercado XYZ",
  "description": "Compra no supermercado",
  "amount": 150.50,
  "paymentMethod": "credit_card",
  "purchasedAt": "2026-03-14T21:47:27.683Z",
  "items": [...],
  "ocrData": {
    "text": "Texto extraído da imagem...",
    "extractedData": {
      "total": 150.50,
      "date": "14/03/2026",
      "cnpj": "12.345.678/0001-90"
    },
    "confidence": 0.95,
    "documentType": "receipt"
  },
  "createdAt": "2026-03-14T21:47:27.683Z",
  "updatedAt": "2026-03-14T21:47:27.683Z"
}
```

## Exemplo Completo com cURL

### Passo 1: Extrair dados da imagem

```bash
curl -X POST http://localhost:3001/api/monolith/ocr/extract-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "documentType": "receipt",
    "language": "por"
  }'
```

### Passo 2: Criar compra com dados do OCR

```bash
curl -X POST http://localhost:3000/api/users/user-id/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-jwt" \
  -d '{
    "type": "market",
    "merchant": "Supermercado XYZ",
    "amount": 150.50,
    "paymentMethod": "credit_card",
    "purchasedAt": "2026-03-14T21:47:27.683Z",
    "ocrData": {
      "text": "Texto extraído...",
      "extractedData": {
        "total": 150.50,
        "date": "14/03/2026"
      },
      "confidence": 0.95,
      "documentType": "receipt"
    }
  }'
```

## Campos Suportados no OCR

### Tipos de Documento

- **receipt**: Recibo/Cupom fiscal
- **nfce**: Nota Fiscal Eletrônica
- **invoice**: Nota Fiscal

### Idiomas

- **por**: Português
- **eng**: Inglês
- **por+eng**: Português + Inglês

## Dados Extraídos por Tipo

### Receipt (Recibo)
- `total`: Valor total
- `date`: Data da compra
- `items`: Itens (quando disponível)

### NFC-e (Nota Fiscal Eletrônica)
- `cnpj`: CNPJ do estabelecimento
- `total`: Valor total
- `date`: Data da emissão
- `items`: Itens da nota

### Invoice (Nota Fiscal)
- `invoiceNumber`: Número da nota
- `total`: Valor total
- `date`: Data da emissão

## Tratamento de Erros

### Erro 400: Image data is required
```json
{
  "statusCode": 400,
  "message": "Image data is required",
  "timestamp": "2026-03-14T21:47:27.683Z",
  "path": "/api/ocr/extract-base64"
}
```

**Solução**: Verifique se o campo `image` ou `imageBase64` está presente no payload.

### Erro 500: OCR extraction failed
```json
{
  "statusCode": 500,
  "message": "OCR extraction failed: Invalid base64 image",
  "timestamp": "2026-03-14T21:47:27.683Z",
  "path": "/api/ocr/extract-base64"
}
```

**Solução**: Verifique se a string base64 é válida.

## Notas Importantes

1. O campo `ocrData` é **opcional** ao criar uma compra
2. Os dados do OCR são armazenados junto com a compra para referência futura
3. O OCR aceita base64 com ou sem prefixo `data:image/...;base64,`
4. A confiança (confidence) varia de 0 a 1 (0% a 100%)
5. O campo `amount` da compra deve corresponder ao `total` extraído do OCR para consistência

## Integração com Frontend

No frontend, o fluxo seria:

```javascript
// 1. Capturar imagem (câmera ou upload)
const imageBase64 = await captureImage(); // retorna string base64

// 2. Enviar para OCR
const ocrResponse = await fetch('/api/monolith/ocr/extract-base64', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image: imageBase64,
    documentType: 'receipt',
    language: 'por'
  })
});

const ocrData = await ocrResponse.json();

// 3. Preencher formulário com dados extraídos
form.amount.value = ocrData.extractedData.total;
form.date.value = ocrData.extractedData.date;

// 4. Enviar compra com dados do OCR
const purchaseResponse = await fetch(`/api/users/${userId}/purchases`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'market',
    merchant: form.merchant.value,
    amount: ocrData.extractedData.total,
    paymentMethod: form.paymentMethod.value,
    purchasedAt: new Date().toISOString(),
    ocrData: ocrData
  })
});

const purchase = await purchaseResponse.json();
console.log('Compra criada:', purchase);
```
