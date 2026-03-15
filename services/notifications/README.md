# Notifications Service

Serviço de notificações com suporte a Email, SMS e Push Notifications.

## Características

- **Email**: SendGrid ou SMTP
- **SMS**: Twilio
- **Push Notifications**: Firebase Cloud Messaging
- **Preferências de Notificação**: Controle granular por usuário
- **Histórico**: Rastreamento completo de notificações
- **Kafka Integration**: Consumidor de eventos para notificações automáticas

## Instalação

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

### Variáveis Obrigatórias

- `KAFKA_BROKERS`: Brokers do Kafka
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`: Configuração do banco de dados

### Provedores de Email

**SendGrid:**
```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key
```

**SMTP:**
```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password
SMTP_FROM=noreply@somaai.com
SMTP_FROM_NAME=SomaAI
```

### SMS (Twilio)

```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Push Notifications (Firebase)

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Desenvolvimento

```bash
npm run start:dev
```

## Build

```bash
npm run build
```

## Produção

```bash
npm run start:prod
```

## API Endpoints

### Enviar Notificação

```http
POST /notifications/send
Content-Type: application/json

{
  "userId": "user-id",
  "type": "email",
  "title": "Título",
  "message": "<h1>Mensagem</h1>",
  "recipient": "user@example.com"
}
```

### Enviar Notificações em Lote

```http
POST /notifications/send-bulk
Content-Type: application/json

{
  "userIds": ["user-1", "user-2"],
  "type": "email",
  "title": "Título",
  "message": "<h1>Mensagem</h1>"
}
```

### Obter Preferências

```http
GET /notifications/preferences/:userId
```

### Atualizar Preferências

```http
PUT /notifications/preferences/:userId
Content-Type: application/json

{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true,
  "marketingEmails": false
}
```

### Registrar Device Token

```http
POST /notifications/device-tokens
Content-Type: application/json

{
  "userId": "user-id",
  "deviceToken": {
    "token": "firebase-device-token",
    "platform": "ios",
    "deviceName": "iPhone 12"
  }
}
```

### Obter Notificações

```http
GET /notifications/:userId?limit=50&offset=0
```

### Marcar como Lida

```http
PUT /notifications/:notificationId/read
```

## Banco de Dados

### Tabelas

- `notifications`: Histórico de notificações
- `notification_preferences`: Preferências por usuário
- `device_tokens`: Tokens de dispositivos para push notifications

## Eventos Kafka

O serviço consome os seguintes eventos:

- `auth.registration.success`: Envia email de boas-vindas
- `user.created`: Envia email de confirmação
- `order.created`: Envia confirmação de pedido

## Estrutura do Projeto

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── kafka/
│   ├── kafka.module.ts
│   └── kafka.service.ts
├── notifications/
│   ├── consumers/
│   │   └── notification.consumer.ts
│   ├── dto/
│   │   ├── notification-preference.dto.ts
│   │   ├── register-device-token.dto.ts
│   │   ├── send-bulk-notification.dto.ts
│   │   └── send-notification.dto.ts
│   ├── entities/
│   │   ├── device-token.entity.ts
│   │   ├── notification-preference.entity.ts
│   │   └── notification.entity.ts
│   ├── enums/
│   │   ├── notification-status.enum.ts
│   │   └── notification-type.enum.ts
│   ├── notifications.controller.ts
│   ├── notifications.module.ts
│   └── notifications.service.ts
└── providers/
    ├── email/
    │   └── email.provider.ts
    ├── push/
    │   └── push.provider.ts
    ├── sms/
    │   └── sms.provider.ts
    └── providers.module.ts
```

## Testes

```bash
npm run test
npm run test:watch
npm run test:cov
```

## Licença

UNLICENSED
