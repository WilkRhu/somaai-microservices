# Fiscal Service

Serviço responsável pela geração e autorização de NFC-e (Nota Fiscal de Consumidor Eletrônica) junto à SEFAZ.

## Funcionalidades

- Geração de NFC-e
- Integração com SEFAZ para autorização
- Assinatura digital de XML
- Cancelamento de NFC-e
- Publicação de eventos via Kafka

## Endpoints

### Gerar NFC-e
```
POST /api/fiscal/nfce/generate
Content-Type: application/json

{
  "establishmentId": "12345678000195",
  "number": 1,
  "series": 1,
  "totalValue": 100.00,
  "items": [
    {
      "code": "001",
      "description": "Produto A",
      "quantity": 1,
      "unitPrice": 100.00,
      "totalPrice": 100.00
    }
  ]
}
```

### Obter NFC-e
```
GET /api/fiscal/nfce/:id
```

### Listar NFC-es
```
GET /api/fiscal/nfce?establishmentId=12345678000195
```

### Cancelar NFC-e
```
POST /api/fiscal/nfce/:id/cancel
Content-Type: application/json

{
  "justification": "Erro na emissão"
}
```

## Variáveis de Ambiente

```
NODE_ENV=development
PORT=3004
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=fiscal_db
DB_SYNCHRONIZE=true
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=fiscal-service
SEFAZ_URL=https://nfe.sefaz.rs.gov.br/webservices/NFeAutorizacao4/NFeAutorizacao4.asmx
SEFAZ_TIMEOUT=30000
JWT_SECRET=your-secret-key
LOG_LEVEL=debug
```

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run start:dev
```

## Build

```bash
npm run build
```

## Testes

```bash
npm run test
```

## Docker

```bash
docker-compose up
```

## Kafka Topics

- `fiscal.nfce.issued` - NFC-e autorizada com sucesso
- `fiscal.nfce.failed` - Falha na autorização de NFC-e

## Integração com SEFAZ

O serviço se integra com a SEFAZ para:
- Autorizar NFC-e
- Consultar status de NFC-e
- Cancelar NFC-e

A integração é feita via SOAP/XML conforme especificação da NFC-e.

## Status de NFC-e

- `pending` - Aguardando processamento
- `processing` - Sendo processada
- `authorized` - Autorizada pela SEFAZ
- `rejected` - Rejeitada pela SEFAZ
- `cancelled` - Cancelada

## Estrutura de Pastas

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── fiscal/
│   ├── fiscal.controller.ts
│   ├── fiscal.module.ts
│   ├── fiscal.service.ts
│   ├── dto/
│   │   ├── generate-nfce.dto.ts
│   │   └── nfce-response.dto.ts
│   ├── entities/
│   │   └── nfce.entity.ts
│   └── services/
│       ├── sefaz.service.ts
│       └── xml-signer.service.ts
└── kafka/
    └── fiscal.producer.ts
```

## Próximas Etapas

- [ ] Implementar assinatura digital real com certificado
- [ ] Integração real com SEFAZ
- [ ] Suporte a múltiplos estados
- [ ] Validação de CNPJ/CPF
- [ ] Geração de QR Code
- [ ] Consulta de NFC-e por chave de acesso
