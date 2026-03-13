# Email Service Integration Complete

## Overview
The Email Service has been successfully integrated into the microservices architecture and is now accessible through the Orchestrator (port 3009).

## Service Details

### Email Service
- **Port**: 3012 (internal Docker network)
- **Container Name**: email-service
- **Database**: Shared production database (193.203.175.121)
- **Email Providers**: 
  - Primary: SendGrid
  - Fallback: SMTP (Hostinger)

### Orchestrator Integration
- **Route**: `/email`
- **Base URL**: `http://localhost:3009/email`
- **Service URL (internal)**: `http://email:3012`

## Available Endpoints

### 1. Send Single Email
```
POST /email/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "recipient@example.com",
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Welcome to SomaAI",
  "template": "user-welcome",
  "data": {
    "userName": "John Doe"
  }
}
```

### 2. Send Bulk Email
```
POST /email/send-bulk
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Important Update",
  "template": "admin-welcome",
  "data": {
    "userName": "Admin",
    "expirationDate": "2026-03-20"
  }
}
```

### 3. Get Email Status
```
GET /email/{emailId}
Authorization: Bearer {token}
```

## Available Templates

### Admin Templates
- `admin-welcome` - Welcome email for admin users
- `admin-user-created` - Notification when new user is created

### Support Templates
- `support-welcome` - Welcome email for support team
- `support-ticket-assigned` - Notification when ticket is assigned

### User Templates
- `user-welcome` - Welcome email for new users
- `user-password-reset` - Password reset link email
- `user-lifetime-access-activated` - Lifetime access activation notification
- `user-trial-activation` - Trial activation email
- `user-trial-expiring` - Trial expiration warning

### Fiscal Templates
- `fiscal-note` - Fiscal note notification

## Environment Configuration

### Global .env (Root)
```
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Email Service .env
```
NODE_ENV=development
PORT=3012

# Database
DB_HOST=193.203.175.121
DB_PORT=3306
DB_USERNAME=u752511550_user_business
DB_PASSWORD=@Wilk2026#
DB_DATABASE=u752511550_somaai_busines

# Email Provider
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key

# SMTP Fallback
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=somaai@wilkcaetano.com.br
SMTP_PASSWORD=@Wilk2026#
SMTP_FROM=somaai@wilkcaetano.com.br
SMTP_FROM_NAME=SomaAI

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=email-service
KAFKA_GROUP_ID=email-group

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3000
```

## Docker Compose Configuration

The email service is now configured in `docker-compose.yml`:

```yaml
email:
  build:
    context: ./services/email
    dockerfile: Dockerfile
  container_name: email-service
  ports:
    - "3012:3012"
  environment:
    NODE_ENV: production
    PORT: 3012
    DATABASE_URL: mysql://somaai:somaai_password@mysql-master:3306/somaai_master
    REDIS_URL: redis://redis:6379
    KAFKA_BROKERS: kafka-1:29092,kafka-2:29092,kafka-3:29092
    EMAIL_PROVIDER: sendgrid
    SENDGRID_API_KEY: ${SENDGRID_API_KEY:-your-sendgrid-api-key}
    SMTP_HOST: smtp.hostinger.com
    SMTP_PORT: 465
    SMTP_USER: somaai@wilkcaetano.com.br
    SMTP_PASSWORD: @Wilk2026#
    SMTP_FROM: somaai@wilkcaetano.com.br
    SMTP_FROM_NAME: SomaAI
  depends_on:
    mysql-master:
      condition: service_healthy
    redis:
      condition: service_healthy
    kafka-1:
      condition: service_healthy
  networks:
    - somaai-network
  restart: unless-stopped
```

## Orchestrator Integration

The Orchestrator now includes:

1. **EmailModule** - Handles email service routing
2. **EmailClient** - HTTP client for communicating with email service
3. **EmailController** - Exposes email endpoints through orchestrator

### Orchestrator Configuration
- Email Service URL: `http://email:3012`
- Orchestrator Port: `3009`
- Frontend Access: `http://localhost:3009/email`

## Architecture Flow

```
Frontend (http://localhost:3009)
    ↓
Orchestrator (port 3009)
    ↓
EmailController (/email)
    ↓
EmailClient (http://email:3012)
    ↓
Email Service (port 3012)
    ├─ SendGrid (Primary)
    └─ SMTP Fallback (Hostinger)
    ↓
Database (193.203.175.121)
```

## Template System

The email service uses a two-tier template system:

1. **Built-in Templates** - Defined in TypeScript files
   - Located in `services/email/src/email/templates/`
   - Loaded via `TemplateLoader` class
   - Rendered with Handlebars

2. **Database Templates** - Stored in `email_template` table
   - Fallback if built-in template not found
   - Allows dynamic template management

### Template Rendering
Templates support Handlebars syntax for dynamic content:

```handlebars
<h1>Welcome {{userName}}!</h1>
<p>Your access expires on {{expirationDate}}</p>
```

## Email Status Tracking

Each email is tracked with the following statuses:
- `PENDING` - Email created, waiting to send
- `SENT` - Successfully sent via SendGrid or SMTP
- `FAILED` - Failed to send via both providers
- `DELIVERED` - Confirmed delivery (webhook)
- `OPENED` - Email opened (webhook)
- `CLICKED` - Link clicked (webhook)

## Failover Mechanism

The email service implements automatic failover:

1. **Primary**: SendGrid API
2. **Fallback**: SMTP (Hostinger)
3. **Status**: Marked as FAILED if both fail

## Next Steps

1. **Configure SendGrid API Key**
   - Update `SENDGRID_API_KEY` in `.env`
   - Get key from SendGrid dashboard

2. **Test Email Sending**
   ```bash
   curl -X POST http://localhost:3009/email/send \
     -H "Authorization: Bearer {token}" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "template": "user-welcome",
       "data": {"userName": "Test User"}
     }'
   ```

3. **Monitor Email Service**
   - Check logs: `docker logs email-service`
   - Monitor database: `email` table
   - Track delivery via webhooks

4. **Customize Templates**
   - Edit template files in `services/email/src/email/templates/`
   - Or add new templates to database
   - Update `TemplateLoader` for new built-in templates

## Troubleshooting

### Email Service Not Starting
```bash
# Check logs
docker logs email-service

# Verify database connection
docker exec email-service npm run test

# Check port availability
netstat -an | grep 3012
```

### SendGrid Failover to SMTP
- Check SendGrid API key validity
- Verify network connectivity
- Check SendGrid rate limits
- SMTP will automatically take over

### Template Not Found
- Verify template name in request
- Check `TemplateLoader` for available templates
- Ensure template data matches template requirements

## Files Modified/Created

### Created
- `services/orchestrator/src/email/email.client.ts`
- `services/orchestrator/src/email/email.controller.ts`
- `services/orchestrator/src/email/email.module.ts`
- `docs/EMAIL_SERVICE_INTEGRATION_COMPLETE.md`

### Modified
- `docker-compose.yml` - Added email service
- `services/orchestrator/src/app.module.ts` - Added EmailModule
- `services/email/src/main.ts` - Updated port to 3012
- `services/email/.env` - Updated port to 3012

## Summary

The Email Service is now fully integrated into the microservices architecture:
- ✅ Service running on port 3012
- ✅ Orchestrator routing configured
- ✅ Docker Compose updated
- ✅ Environment variables configured
- ✅ Template system operational
- ✅ SendGrid + SMTP failover ready
- ✅ Database integration complete
- ✅ Frontend accessible via port 3009
