# OCR Extract Base64 Implementation

## Overview
Implementada a rota `POST /api/monolith/ocr/extract-base64` para extrair texto e dados estruturados de imagens em base64.

## Arquivos Criados

### Serviço OCR (services/ocr)
1. **services/ocr/src/ocr/dto/extract-base64.dto.ts**
   - DTO para receber imagem em base64
   - Campos: `imageBase64`, `documentType` (opcional), `language` (opcional)

2. **services/ocr/src/ocr/dto/extract-response.dto.ts**
   - DTO de resposta com dados extraídos
   - Campos: `text`, `extractedData`, `confidence`, `documentType`

### Monolith (services/monolith)
1. **services/monolith/src/ocr/ocr.service.ts**
   - Serviço que faz proxy para o serviço OCR
   - Método: `extractBase64(data, authToken)`

2. **services/monolith/src/ocr/ocr.controller.ts**
   - Controller com rota `POST /api/monolith/ocr/extract-base64`
   - Requer autenticação JWT

3. **services/monolith/src/ocr/ocr.module.ts**
   - Módulo OCR do monolith

## Arquivos Modificados

### services/ocr/src/ocr/ocr.service.ts
- Adicionado método `extractBase64(extractDto: ExtractBase64Dto)`
- Extrai texto e dados estruturados de forma síncrona
- Retorna resposta imediata com confiança da extração

### services/ocr/src/ocr/ocr.controller.ts
- Adicionada rota `POST /api/ocr/extract-base64`
- Requer autenticação JWT

### services/monolith/src/app.module.ts
- Importado `OcrModule`
- Adicionado ao array de imports

## Rotas Disponíveis

### OCR Service (porta 3007)
```
POST /api/ocr/extract-base64
```

### Monolith (porta 3010)
```
POST /api/monolith/ocr/extract-base64
```

## Request Body
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "documentType": "receipt",
  "language": "por"
}
```

## Response
```json
{
  "text": "Extracted text from image",
  "extractedData": {
    "invoiceNumber": "123456",
    "date": "2026-03-14"
  },
  "confidence": 0.95,
  "documentType": "receipt"
}
```

## Diferenças entre Rotas

### `/api/ocr/extract-base64` (OCR Service)
- Extração síncrona
- Resposta imediata
- Ideal para processamento rápido

### `/api/ocr/process` (OCR Service)
- Processamento assíncrono
- Salva em banco de dados
- Publica evento Kafka
- Ideal para processamento em background

### `/api/monolith/ocr/extract-base64` (Monolith)
- Proxy para o serviço OCR
- Mesma funcionalidade da rota do OCR Service
- Centraliza acesso via monolith

## Autenticação
Todas as rotas requerem token JWT no header:
```
Authorization: Bearer <token>
```

## Variáveis de Ambiente
- `OCR_SERVICE_URL`: URL do serviço OCR (padrão: http://localhost:3007)
- `OCR_LANGUAGE`: Idioma padrão para OCR (padrão: por)
- `OCR_CONFIDENCE_THRESHOLD`: Limite de confiança (padrão: 0.5)
