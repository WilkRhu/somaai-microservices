# Email Consumer Implementation - Disparar Email na Criação de Usuário

## Overview

Implementação de um consumer Kafka no serviço de Email que escuta eventos de criação de usuário e dispara automaticamente emails de boas-vindas.

## Arquitetura

### Fluxo de Envio de Email

```
1. Usuário se registra no Auth Service
   ↓
2. Usuário é criado no banco de dados do Auth
   ↓
3. AuthService publica evento Kafka: "auth.registration.success"
   ↓
4. Email Service recebe o evento via Kafka Consumer
   ↓
5. RegistrationConsumer processa o evento
   ↓
6. EmailService envia email de boas-vindas
   ↓
7. Email é enviado via SendGrid ou SMTP
```

## Componentes Implementados

### 1. Email Service - Kafka Service

**Arquivo:** `services/email/src/kafka/kafka.service.ts`

Serviço responsável por gerenciar conexão com Kafka:

```typescript
- publishEvent(topic: string, message: any): Promise<void>
  Publica eventos no Kafka
  
- subscribeToTopic(topic: string, callback: (message: any) => Promise<void>): Promise<void>
  Escuta eventos de um tópico específico
```

**Características:**
- Retry automático com backoff exponencial
- Graceful degradation se Kafka não estiver disponível
- Logging detalhado de conexão e eventos

### 2. Email Service - Kafka Module

**Arquivo:** `services/email/src/kafka/kafka.module.ts`

Módulo que exporta o KafkaService para uso em outros módulos.

### 3. Email Service - Registration Consumer

**Arquivo:** `services/email/src/email/consumers/registration.consumer.ts`

Consumer que escuta eventos de registro e dispara emails:

```typescript
- handleRegistrationSuccess(message: any): Promise<void>
  Processa evento "auth.registration.success"
  Envia email de boas-vindas
  
- handleUserCreated(message: any): Promise<void>
  Processa evento "user.created"
  Envia email de boas-vindas
```

**Características:**
- Escuta dois tópicos: `auth.registration.success` e `user.created`
- Usa template `user-welcome` para enviar emails
- Tratamento de erros sem falhar o fluxo
- Logging de sucesso e erro

### 4. Email Module Atualizado

**Arquivo:** `services/email/src/email/email.module.ts`

Modificações:
- Importa `KafkaModule`
- Adiciona `RegistrationConsumer` aos providers
- Exporta `UserSyncService`

## Configuração

### Variáveis de Ambiente

**Email Service (.env):**
```env
# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=email-service-group
```

### Dependências

**Email Service - package.json:**
```json
"kafkajs": "^2.2.4"
```

## Fluxo Detalhado

### Registro de Usuário

1. Cliente envia POST `/api/auth/register`
2. AuthService cria usuário no banco de dados
3. AuthService publica evento Kafka: `auth.registration.success`
   ```json
   {
     "userId": "550e8400-e29b-41d4-a716-446655440000",
     "email": "user@example.com",
     "timestamp": "2026-03-14T03:45:00.000Z"
   }
   ```
4. Email Service recebe o evento
5. RegistrationConsumer processa o evento
6. EmailService envia email com template `user-welcome`
7. Email é enviado via SendGrid ou SMTP

### Eventos Kafka

**Tópico: `auth.registration.success`**
```json
{
  "userId": "string",
  "email": "string",
  "timestamp": "ISO 8601 date"
}
```

**Tópico: `user.created`**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "string",
  "createdAt": "ISO 8601 date"
}
```

## Templates de Email

### Template: `user-welcome`

**Localização:** `services/email/src/email/templates/user/welcome.template.ts`

**Dados esperados:**
```typescript
{
  userName: string  // Nome ou email do usuário
}
```

**Exemplo de uso:**
```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Bem-vindo ao SomaAI!',
  template: 'user-welcome',
  data: {
    userName: 'John Doe'
  }
});
```

## Tratamento de Erros

### Kafka não disponível

Se o Kafka não estiver disponível:
- O serviço tenta reconectar com retry automático
- Após 5 tentativas, continua sem Kafka
- Emails podem ser disparados manualmente via API

### Email falha ao enviar

Se o email falhar ao enviar:
- Tenta SendGrid primeiro
- Se falhar, tenta SMTP
- Se ambos falharem, loga o erro
- Não falha o fluxo de registro

### Evento malformado

Se o evento Kafka estiver malformado:
- Loga o erro
- Continua processando outros eventos
- Não falha o consumer

## Monitoramento

### Logs

Todos os eventos são logados:
- Conexão com Kafka
- Subscrição a tópicos
- Recebimento de eventos
- Envio de emails
- Erros de processamento

### Métricas Recomendadas

1. **Taxa de Sucesso de Envio de Email**
   - Emails enviados com sucesso / Total de eventos recebidos

2. **Tempo de Processamento**
   - Tempo médio entre recebimento do evento e envio do email

3. **Erros de Envio**
   - Número de falhas de envio
   - Tipos de erro mais comuns

## Próximos Passos

### 1. Implementar Retry de Email

Adicionar retry automático para emails que falharam:

```typescript
// services/email/src/email/services/email-retry.service.ts

async retryFailedEmails(): Promise<void> {
  const failedEmails = await this.getFailedEmails();
  for (const email of failedEmails) {
    await this.emailService.sendEmail(email);
  }
}
```

### 2. Implementar Fila de Email

Usar Redis para fila de emails:

```typescript
async queueEmail(emailData: SendEmailDto): Promise<void> {
  await this.redisService.lpush('email-queue', JSON.stringify(emailData));
}
```

### 3. Implementar Webhooks de Entrega

Receber webhooks do SendGrid para rastrear entrega:

```typescript
@Post('webhooks/sendgrid')
async handleSendgridWebhook(@Body() events: any[]): Promise<void> {
  // Processar eventos de entrega
}
```

### 4. Implementar Templates Dinâmicos

Permitir templates customizados por usuário:

```typescript
async sendCustomEmail(userId: string, templateId: string): Promise<void> {
  const template = await this.getCustomTemplate(userId, templateId);
  // Enviar email com template customizado
}
```

### 5. Implementar Preferências de Email

Permitir que usuários escolham quais emails receber:

```typescript
async sendEmailIfPreferred(userId: string, emailType: string): Promise<void> {
  const preferences = await this.getUserEmailPreferences(userId);
  if (preferences[emailType]) {
    await this.emailService.sendEmail(...);
  }
}
```

## Testes

### Teste Manual

#### 1. Registrar novo usuário

```bash
curl -X POST http://localhost:3010/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### 2. Verificar logs do Email Service

```bash
# Procurar por:
# - "Registered consumer for auth.registration.success topic"
# - "Processing registration success event for user"
# - "Welcome email sent successfully to test@example.com"
```

#### 3. Verificar email recebido

Verificar se o email foi recebido em `test@example.com`

### Teste de Integração

```typescript
// services/email/test/integration/registration.consumer.spec.ts

describe('RegistrationConsumer', () => {
  it('should send welcome email on registration success', async () => {
    // Test implementation
  });

  it('should handle kafka event processing error gracefully', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Erro: "Cannot find module 'kafkajs'"

**Solução:**
```bash
cd services/email
npm install kafkajs
```

### Erro: "Kafka service not initialized"

**Causa:** Kafka não está disponível

**Verificar:**
1. Se Kafka está rodando: `docker ps | grep kafka`
2. Se `KAFKA_BROKERS` está configurado corretamente
3. Logs do Email Service para erros de conexão

### Email não é enviado

**Verificar:**
1. Se o Email Service está rodando
2. Se o Kafka está rodando
3. Se o evento está sendo publicado no Auth Service
4. Logs do Email Service para erros de processamento
5. Configuração de SendGrid ou SMTP

### Evento não é recebido

**Verificar:**
1. Se o consumer está registrado: procurar por "Registered consumer for auth.registration.success topic"
2. Se o tópico existe no Kafka
3. Se o evento está sendo publicado com o nome correto
4. Logs do Kafka para erros de publicação

## Documentação Adicional

- [EMAIL_SERVICE_INTEGRATION_COMPLETE.md](./EMAIL_SERVICE_INTEGRATION_COMPLETE.md) - Documentação do serviço de email
- [KAFKA_INTEGRATION_COMPLETE.md](./KAFKA_INTEGRATION_COMPLETE.md) - Documentação de integração Kafka
