# OCR Service - Simplificado

## Mudanças Realizadas

O serviço OCR foi simplificado para ser um serviço **stateless** que apenas executa Tesseract para extração de texto.

### Removido
- ❌ Dependência do TypeORM (banco de dados)
- ❌ Kafka Consumer/Producer
- ❌ Entidades de banco de dados
- ❌ Métodos de persistência (processImage, getProcessing, listProcessing)

### Mantido
- ✅ Rota `POST /api/ocr/extract-base64`
- ✅ Tesseract Service para extração de texto
- ✅ JWT Authentication
- ✅ Logging

## Arquitetura

```
Cliente
  ↓
POST /api/ocr/extract-base64
  ↓
OcrController
  ↓
OcrService
  ↓
TesseractService (Tesseract.js)
  ↓
Resposta com texto e dados extraídos
```

## Configuração

### .env
```
NODE_ENV=development
PORT=3007
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
LOG_LEVEL=debug
```

### Dependências Necessárias
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "class-validator": "^0.14.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "tesseract.js": "^4.1.1"
}
```

## Iniciar o Serviço

```bash
cd services/ocr
npm install --legacy-peer-deps
npm run start:dev
```

O serviço estará disponível em `http://localhost:3007`

## Rota Disponível

### POST /api/ocr/extract-base64

**Request:**
```json
{
  "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "documentType": "receipt",
  "language": "por"
}
```

**Response:**
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

## Características

- **Stateless**: Sem persistência de dados
- **Rápido**: Resposta síncrona
- **Leve**: Sem dependências de banco de dados
- **Escalável**: Pode ser replicado facilmente
- **Seguro**: Autenticação JWT

## Próximos Passos

1. Instalar dependências: `npm install --legacy-peer-deps`
2. Iniciar o serviço: `npm run start:dev`
3. Testar a rota via Postman ou curl
4. Integrar com o orchestrador/monolith
