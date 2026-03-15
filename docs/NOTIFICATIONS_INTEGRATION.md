# Integração do Notifications Service

## Adicionando ao Docker Compose

Adicione a seguinte configuração ao seu `docker-compose.yml`:

```yaml
notifications:
  build:
    context: ./services/notifications
    dockerfile: Dockerfile
  container_name: notifications-service
  ports:
    - "3011:3011"
  environment:
    - NODE_ENV=production
    - PORT=3011
    - DB_HOST=mysql-master
    - DB_PORT=3306
    - DB_USERNAME=somaai
    - DB_PASSWORD=somaai_password
    - DB_DATABASE=somaai_notifications
    - DB_SYNCHRONIZE=false
    - DB_LOGGING=false
    - KAFKA_BROKERS=kafka-1:29092,kafka-2:29092,kafka-3:29092
    - KAFKA_GROUP_ID=notifications-group
    - KAFKA_CLIENT_ID=notifications-service
    - JWT_SECRET=${JWT_SECRET}
    - JWT_EXPIRATION=24h
    - EMAIL_PROVIDER=sendgrid
    - SENDGRID_API_KEY=${SENDGRID_API_KEY}
    - SMTP_HOST=smtp.hostinger.com
    - SMTP_PORT=465
    - SMTP_SECURE=true
    - SMTP_USER=${SMTP_USER}
    - SMTP_PASS=${SMTP_PASS}
    - SMTP_FROM=noreply@somaai.com
    - SMTP_FROM_NAME=SomaAI
    - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
    - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
    - TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}
    - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
    - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
    - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
  depends_on:
    - mysql-master
    - kafka-1
    - kafka-2
    - kafka-3
  networks:
    - somaai-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3011/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

## Variáveis de Ambiente

Adicione ao seu `.env`:

```env
# Notifications Service
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_USER=your-email@hostinger.com
SMTP_PASS=your-smtp-password
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## Inicializar Banco de Dados

Crie um script `scripts/init-notifications-db.js`:

```javascript
const mysql = require('mysql2/promise');

async function initNotificationsDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Create database
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE || 'somaai_notifications'}`
    );

    // Use database
    await connection.execute(
      `USE ${process.env.DB_DATABASE || 'somaai_notifications'}`
    );

    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        type ENUM('email', 'sms', 'push') NOT NULL,
        status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed') DEFAULT 'pending',
        title VARCHAR(255) NOT NULL,
        message LONGTEXT NOT NULL,
        recipient VARCHAR(255),
        metadata JSON,
        externalId VARCHAR(255),
        errorMessage LONGTEXT,
        retryCount INT DEFAULT 0,
        sentAt TIMESTAMP NULL,
        deliveredAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_userId_createdAt (userId, createdAt),
        INDEX idx_status_createdAt (status, createdAt)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
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
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        token LONGTEXT NOT NULL,
        platform VARCHAR(50) NOT NULL,
        deviceName VARCHAR(255),
        isActive BOOLEAN DEFAULT true,
        lastUsedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_userId_isActive (userId, isActive)
      )
    `);

    console.log('✓ Notifications database initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing notifications database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

initNotificationsDB().catch(console.error);
```

Execute:

```bash
node scripts/init-notifications-db.js
```

## Integração com Orchestrator

Adicione ao `services/orchestrator/src/app.module.ts`:

```typescript
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // ... outros imports
    HttpModule,
  ],
})
export class AppModule {}
```

Crie `services/orchestrator/src/notifications/notifications.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(private httpService: HttpService) {}

  async sendNotification(data: any) {
    const url = `${process.env.NOTIFICATIONS_SERVICE_URL}/notifications/send`;
    return firstValueFrom(this.httpService.post(url, data));
  }

  async sendEmail(data: any) {
    const url = `${process.env.NOTIFICATIONS_SERVICE_URL}/notifications/email/send`;
    return firstValueFrom(this.httpService.post(url, data));
  }

  async getPreferences(userId: string) {
    const url = `${process.env.NOTIFICATIONS_SERVICE_URL}/notifications/preferences/${userId}`;
    return firstValueFrom(this.httpService.get(url));
  }

  async updatePreferences(userId: string, data: any) {
    const url = `${process.env.NOTIFICATIONS_SERVICE_URL}/notifications/preferences/${userId}`;
    return firstValueFrom(this.httpService.put(url, data));
  }
}
```

## Testando a Integração

### 1. Verificar Health

```bash
curl http://localhost:3011/health
```

### 2. Enviar Email

```bash
curl -X POST http://localhost:3011/notifications/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Teste",
    "template": "user-welcome",
    "data": {
      "userName": "João"
    }
  }'
```

### 3. Enviar Notificação

```bash
curl -X POST http://localhost:3011/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "type": "email",
    "title": "Bem-vindo",
    "message": "<h1>Bem-vindo!</h1>",
    "recipient": "user@example.com"
  }'
```

### 4. Obter Preferências

```bash
curl http://localhost:3011/notifications/preferences/user-123
```

## Monitoramento

### Logs

```bash
docker logs -f notifications-service
```

### Métricas

Adicione ao Prometheus (`monitoring/prometheus.yml`):

```yaml
- job_name: 'notifications-service'
  static_configs:
    - targets: ['localhost:3011']
```

## Troubleshooting

### Erro de Conexão com Banco de Dados

```bash
docker logs notifications-service | grep "database"
```

Verifique se o MySQL está rodando:

```bash
docker ps | grep mysql
```

### Erro de Conexão com Kafka

```bash
docker logs notifications-service | grep "Kafka"
```

Verifique se o Kafka está rodando:

```bash
docker ps | grep kafka
```

### Email não está sendo enviado

1. Verifique as credenciais do SendGrid/SMTP
2. Verifique se o email está na lista de preferências
3. Verifique os logs do serviço

## Próximos Passos

1. Configurar alertas no Prometheus
2. Implementar dashboard no Grafana
3. Adicionar testes de integração
4. Implementar retry logic
5. Adicionar rate limiting
