# Notifications Service - Setup Completo

## Visão Geral

O serviço de notificações é um microserviço centralizado que gerencia:
- **Email**: SendGrid ou SMTP
- **SMS**: Twilio
- **Push Notifications**: Firebase Cloud Messaging
- **Preferências de Notificação**: Controle granular por usuário
- **Histórico**: Rastreamento completo de notificações

## Estrutura do Serviço

```
services/notifications/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── kafka/
│   │   ├── kafka.module.ts
│   │   └── kafka.service.ts
│   ├── notifications/
│   │   ├── consumers/
│   │   │   └── notification.consumer.ts
│   │   ├── dto/
│   │   │   ├── notification-preference.dto.ts
│   │   │   ├── register-device-token.dto.ts
│   │   │   ├── send-bulk-notification.dto.ts
│   │   │   └── send-notification.dto.ts
│   │   ├── entities/
│   │   │   ├── device-token.entity.ts
│   │   │   ├── notification-preference.entity.ts
│   │   │   └── notification.entity.ts
│   │   ├── enums/
│   │   │   ├── notification-status.enum.ts
│   │   │   └── notification-type.enum.ts
│   │   ├── email/
│   │   │   ├── consumers/
│   │   │   │   └── registration.consumer.ts
│   │   │   ├── dto/
│   │   │   │   ├── send-bulk-email.dto.ts
│   │   │   │   └── send-email.dto.ts
│   │   │   ├── enums/
│   │   │   │   └── email-status.enum.ts
│   │   │   ├── services/
│   │   │   │   ├── sendgrid.service.ts
│   │   │   │   └── smtp.service.ts
│   │   │   ├── templates/
│   │   │   │   └── template-loader.ts
│   │   │   ├── email.controller.ts
│   │   │   ├── email.module.ts
│   │   │   └── email.service.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.module.ts
│   │   └── notifications.service.ts
│   └── providers/
│       ├── email/
│       │   └── email.provider.ts
│       ├── push/
│       │   └── push.provider.ts
│       ├── sms/
│       │   └── sms.provider.ts
│       └── providers.module.ts
├── .env.example
├── .eslintrc.js
├── .gitignore
├── Dockerfile
├── jest.config.js
├── nest-cli.json
├── package.json
├── README.md
└── tsconfig.json
```

## Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp services/notifications/.env.example services/notifications/.env
```

### 2. Email Configuration

**Option A: SendGrid**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_FROM=noreply@somaai.com
SMTP_FROM_NAME=SomaAI
```

**Option B: SMTP (Hostinger)**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@domain.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@somaai.com
SMTP_FROM_NAME=SomaAI
```

### 3. SMS Configuration (Twilio)

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Push Notifications (Firebase)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 5. Database Configuration

```env
DB_HOST=mysql-master
DB_PORT=3306
DB_USERNAME=somaai
DB_PASSWORD=somaai_password
DB_DATABASE=somaai_notifications
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### 6. Kafka Configuration

```env
KAFKA_BROKERS=kafka-1:29092,kafka-2:29092,kafka-3:29092
KAFKA_GROUP_ID=notifications-group
KAFKA_CLIENT_ID=notifications-service
```

## Instalação e Execução

### Desenvolvimento

```bash
cd services/notifications
npm install
npm run start:dev
```

### Build

```bash
npm run build
```

### Produção

```bash
npm run start:prod
```

## API Endpoints

### Notificações

#### Enviar Notificação
```http
POST /notifications/send
Content-Type: application/json

{
  "userId": "user-123",
  "type": "email",
  "title": "Bem-vindo",
  "message": "<h1>Bem-vindo ao SomaAI!</h1>",
  "recipient": "user@example.com"
}
```

#### Enviar Notificações em Lote
```http
POST /notifications/send-bulk
Content-Type: application/json

{
  "userIds": ["user-1", "user-2", "user-3"],
  "type": "email",
  "title": "Promoção",
  "message": "<h1>Confira nossa promoção!</h1>"
}
```

#### Obter Preferências
```http
GET /notifications/preferences/:userId
```

#### Atualizar Preferências
```http
PUT /notifications/preferences/:userId
Content-Type: application/json

{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true,
  "marketingEmails": false,
  "quietHours": {
    "enabled": true,
    "startTime": "22:00",
    "endTime": "08:00",
    "timezone": "America/Sao_Paulo"
  }
}
```

#### Registrar Device Token
```http
POST /notifications/device-tokens
Content-Type: application/json

{
  "userId": "user-123",
  "deviceToken": {
    "token": "firebase-device-token",
    "platform": "ios",
    "deviceName": "iPhone 12"
  }
}
```

#### Obter Notificações
```http
GET /notifications/:userId?limit=50&offset=0
```

#### Marcar como Lida
```http
PUT /notifications/:notificationId/read
```

### Email

#### Enviar Email
```http
POST /notifications/email/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Bem-vindo",
  "template": "user-welcome",
  "data": {
    "userName": "João"
  }
}
```

#### Enviar Email em Lote
```http
POST /notifications/email/send-bulk
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Promoção",
  "template": "order-confirmation",
  "data": {
    "orderId": "ORD-123",
    "total": "99.90"
  }
}
```

#### Obter Status do Email
```http
GET /notifications/email/status/:emailId
```

## Templates de Email

### Disponíveis

1. **user-welcome**: Boas-vindas para novo usuário
2. **order-confirmation**: Confirmação de pedido
3. **password-reset**: Redefinição de senha
4. **email-verification**: Verificação de email

### Uso

```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Bem-vindo',
  template: 'user-welcome',
  data: {
    userName: 'João Silva'
  }
});
```

## Eventos Kafka

O serviço consome os seguintes eventos:

### auth.registration.success
Enviado quando um usuário se registra com sucesso.

```json
{
  "userId": "user-123",
  "email": "user@example.com"
}
```

**Ação**: Envia email de boas-vindas

### user.created
Enviado quando um novo usuário é criado.

```json
{
  "userId": "user-123",
  "email": "user@example.com",
  "firstName": "João"
}
```

**Ação**: Envia email de confirmação

### order.created
Enviado quando um pedido é criado.

```json
{
  "userId": "user-123",
  "orderId": "ORD-123",
  "email": "user@example.com"
}
```

**Ação**: Envia confirmação de pedido

## Banco de Dados

### Tabelas

#### notifications
```sql
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  type ENUM('email', 'sms', 'push') NOT NULL,
  status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed') DEFAULT 'pending',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient VARCHAR(255),
  metadata JSON,
  externalId VARCHAR(255),
  errorMessage TEXT,
  retryCount INT DEFAULT 0,
  sentAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId_createdAt (userId, createdAt),
  INDEX idx_status_createdAt (status, createdAt)
);
```

#### notification_preferences
```sql
CREATE TABLE notification_preferences (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  emailEnabled BOOLEAN DEFAULT true,
  smsEnabled BOOLEAN DEFAULT true,
  pushEnabled BOOLEAN DEFAULT true,
  marketingEmails BOOLEAN DEFAULT true,
  transactionalEmails BOOLEAN DEFAULT true,
  transactionalSms BOOLEAN DEFAULT true,
  transactionalPush BOOLEAN DEFAULT true,
  quietHours JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### device_tokens
```sql
CREATE TABLE device_tokens (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  token TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  deviceName VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  lastUsedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId_isActive (userId, isActive)
);
```

## Integração com Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3011

CMD ["node", "dist/main"]
```

### Docker Compose

```yaml
notifications:
  build:
    context: ./services/notifications
    dockerfile: Dockerfile
  ports:
    - "3011:3011"
  environment:
    - NODE_ENV=production
    - DB_HOST=mysql-master
    - DB_PORT=3306
    - DB_USERNAME=somaai
    - DB_PASSWORD=somaai_password
    - DB_DATABASE=somaai_notifications
    - KAFKA_BROKERS=kafka-1:29092,kafka-2:29092,kafka-3:29092
    - EMAIL_PROVIDER=sendgrid
    - SENDGRID_API_KEY=${SENDGRID_API_KEY}
  depends_on:
    - mysql-master
    - kafka-1
  networks:
    - somaai-network
```

## Testes

```bash
npm run test
npm run test:watch
npm run test:cov
```

## Troubleshooting

### Email não está sendo enviado

1. Verifique as credenciais do provedor (SendGrid ou SMTP)
2. Verifique se o email está na lista de preferências
3. Verifique os logs: `docker logs notifications-service`

### SMS não está sendo enviado

1. Verifique as credenciais do Twilio
2. Verifique se o número de telefone está no formato correto
3. Verifique o saldo da conta Twilio

### Push notifications não funcionam

1. Verifique as credenciais do Firebase
2. Verifique se o device token está registrado
3. Verifique se o dispositivo está ativo

## Próximos Passos

1. Implementar retry logic com exponential backoff
2. Adicionar rate limiting
3. Implementar notification scheduling
4. Adicionar webhook para eventos de entrega
5. Criar dashboard de notificações
