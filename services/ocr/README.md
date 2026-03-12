# OCR Service

Serviço de processamento de imagens com OCR (Optical Character Recognition) para a arquitetura de microserviços SomaAI.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Docker (opcional)

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run start:dev
```

### Build

```bash
npm run build
```

### Testes

```bash
npm run test
npm run test:cov
npm run test:e2e
```

## 🐳 Docker

### Build

```bash
docker build -t somaai-ocr-service .
```

### Run

```bash
docker-compose up -d
```

## 📡 Endpoints

### OCR Processing

- `POST /api/ocr/process` - Processar imagem
  ```json
  {
    "fileName": "nfce.jpg",
    "documentType": "nfce",
    "imageBase64": "base64_encoded_image",
    "referenceId": "sale-123"
  }
  ```

- `GET /api/ocr/:id` - Obter resultado do processamento

- `GET /api/ocr?status=completed` - Listar processamentos

## 🔐 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

### Principais
- `APP_PORT` - Porta do serviço (padrão: 3006)
- `OCR_LANGUAGE` - Idioma para OCR (padrão: por)
- `OCR_CONFIDENCE_THRESHOLD` - Limite de confiança (padrão: 0.5)

## 📚 Documentação

- [Arquitetura](../../docs/ARCHITECTURE.md)
- [Guia de Implementação](../../docs/IMPLEMENTATION_GUIDE.md)
- [Kafka Guide](../../docs/KAFKA_GUIDE.md)

## 🔄 Fluxo de Processamento

1. Cliente envia imagem em base64
2. Serviço cria registro de processamento
3. Tesseract.js processa a imagem
4. Dados são extraídos e estruturados
5. Evento é publicado no Kafka
6. Cliente pode consultar resultado

## 📊 Tipos de Documentos Suportados

- `nfce` - Nota Fiscal Eletrônica
- `receipt` - Recibos
- `invoice` - Faturas

## 🎯 Eventos Kafka

### Publicados
- `ocr.processing.completed` - Processamento concluído
- `ocr.processing.failed` - Processamento falhou

### Consumidos
- Nenhum (serviço independente)

## 📝 Licença

Proprietary - SomaAI
