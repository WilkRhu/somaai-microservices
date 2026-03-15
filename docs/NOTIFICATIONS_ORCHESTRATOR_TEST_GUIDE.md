# Guia de Teste: Notificações via Orquestrador

Este guia descreve como testar o fluxo completo de notificações passando pelo orquestrador.

## Arquitetura do Fluxo

```
Orquestrador (3000)
    ↓
Kafka (9092)
    ↓
Serviço de Notificações (3005)
    ↓
Email Service / Push Service / SMS Service
```

## Pré-requisitos

- Docker e Docker Compose rodando
- Serviços iniciados:
  - Orquestrador (porta 3000)
  - Serviço de Notificações (porta 3005)
  - Kafka (porta 9092)
  - PostgreSQL (porta 5432)

### Iniciar Serviços

```bash
# Iniciar todos os serviços
./scripts/start-all-services.sh

# Ou no Windows
./scripts/start-all-services.ps1
```

## Scripts de Teste Disponíveis

### 1. Script Bash (Linux/Mac)

```bash
chmod +x scripts/test-notifications-orchestrator.sh
./scripts/test-notifications-orchestrator.sh
```

**O que testa:**
- Envio de notificação por email
- Envio em lote
- Preferências de notificação
- Device tokens
- Envio de emails direto
- Envio de emails em lote
- Recuperação de notificações
- Status de emails

### 2. Script PowerShell (Windows)

```powershell
.\scripts\test-notifications-orchestrator.ps1
```

Mesmos testes que o script Bash, mas com sintaxe PowerShell.

### 3. Script Node.js (Integração Kafka)

```bash
node scripts/test-notifications-kafka-integration.js
```

**O que testa:**
- Todos os endpoints HTTP
- Monitoramento de eventos Kafka em tempo real
- Integração completa com o broker Kafka

## Endpoints Testados

### Notificações

#### 1. Enviar Notificação
```http
POST /notifications/send
Content-Type: application/json

{
  "userId": "user-123",
  "type": "EMAIL|SMS|PUSH",
  "title": "Título",
  "message": "Mensagem",
  "recipient": "email@example.com",
  "metadata": {
    "source": "orchestrator-test"
  }
}
```

#### 2. Enviar Notificações em Lote
```http
POST /notifications/send-bulk
Content-Type: application/json

{
  "notifications": [
    {
      "userId": "user-123",
      "type": "EMAIL",
      "title": "Título",
      "message": "Mensagem",
      "recipient": "email@example.com"
    }
  ]
}
```

#### 3. Obter Preferências
```http
GET /notifications/preferences/:userId
```

#### 4. Atualizar Preferências
```http
PUT /notifications/preferences/:userId
Content-Type: application/json

{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "marketingEmails": true
}
```

#### 5. Registrar Device Token
```http
POST /notifications/device-tokens
Content-Type: application/json

{
  "userId": "user-123",
  "deviceToken": {
    "token": "device-token-abc123xyz",
    "platform": "ios|android",
    "deviceName": "iPhone 14"
  }
}
```

#### 6. Obter Notificações do Usuário
```http
GET /notifications/:userId?limit=10&offset=0
```

#### 7. Marcar como Lida
```http
PUT /notifications/:notificationId/read
```

### Email

#### 1. Enviar Email
```http
POST /notifications/email/send
Content-Type: application/json

{
  "recipient": "user@example.com",
  "subject": "Assunto",
  "template": "welcome",
  "variables": {
    "userName": "João",
    "activationLink": "https://example.com/activate/123"
  }
}
```

#### 2. Enviar Emails em Lote
```http
POST /notifications/email/send-bulk
Content-Type: application/json

{
  "emails": [
    {
      "recipient": "user1@example.com",
      "subject": "Assunto",
      "template": "promotion",
      "variables": {
        "discount": "20%"
      }
    }
  ]
}
```

#### 3. Verificar Status de Email
```http
GET /notifications/email/status/:emailId
```

## Fluxo de Teste Completo

### Passo 1: Preparar Ambiente
```bash
# Verificar se os serviços estão rodando
curl http://localhost:3000/health  # Orquestrador
curl http://localhost:3005/health  # Notificações
```

### Passo 2: Executar Testes
```bash
# Escolha um dos scripts
./scripts/test-notifications-orchestrator.sh
# ou
node scripts/test-notifications-kafka-integration.js
```

### Passo 3: Verificar Logs
```bash
# Logs do serviço de notificações
docker logs notifications-service

# Logs do Kafka
docker logs kafka

# Logs do orquestrador
docker logs orchestrator
```

### Passo 4: Validar Resultados
- Verificar se as notificações foram criadas no banco de dados
- Confirmar se os eventos foram publicados no Kafka
- Validar se os emails foram enviados (verificar logs do email service)
- Confirmar se as preferências foram salvas

## Casos de Teste

### Caso 1: Notificação por Email
**Objetivo:** Testar envio de notificação por email através do orquestrador

**Passos:**
1. Enviar POST para `/notifications/send` com tipo EMAIL
2. Verificar se o evento foi publicado no Kafka
3. Confirmar se a notificação foi criada no banco de dados
4. Validar se o email foi enfileirado para envio

**Resultado Esperado:**
- Status 200/201
- Evento no Kafka com tipo `notification.send`
- Notificação no banco de dados
- Email enfileirado

### Caso 2: Preferências de Notificação
**Objetivo:** Testar atualização de preferências

**Passos:**
1. Enviar PUT para `/notifications/preferences/:userId`
2. Recuperar preferências com GET
3. Validar se as preferências foram atualizadas

**Resultado Esperado:**
- Preferências atualizadas no banco de dados
- GET retorna as preferências corretas

### Caso 3: Device Token
**Objetivo:** Testar registro de device token para push notifications

**Passos:**
1. Enviar POST para `/notifications/device-tokens`
2. Recuperar preferências do usuário
3. Validar se o token foi registrado

**Resultado Esperado:**
- Device token salvo no banco de dados
- Token associado ao usuário correto

### Caso 4: Envio em Lote
**Objetivo:** Testar envio de múltiplas notificações

**Passos:**
1. Enviar POST para `/notifications/send-bulk` com múltiplas notificações
2. Verificar se todos os eventos foram publicados
3. Confirmar se todas as notificações foram criadas

**Resultado Esperado:**
- Todos os eventos no Kafka
- Todas as notificações no banco de dados

## Troubleshooting

### Erro: Connection refused
```
Solução: Verificar se os serviços estão rodando
docker ps | grep notifications
docker ps | grep orchestrator
```

### Erro: Kafka broker not available
```
Solução: Verificar se o Kafka está rodando
docker ps | grep kafka
docker logs kafka
```

### Erro: Database connection failed
```
Solução: Verificar se o PostgreSQL está rodando
docker ps | grep postgres
docker logs postgres
```

### Notificações não aparecem no banco
```
Solução: 
1. Verificar logs do serviço de notificações
2. Confirmar se o Kafka está processando eventos
3. Validar se o consumer está conectado
```

### Emails não são enviados
```
Solução:
1. Verificar logs do email service
2. Confirmar credenciais SMTP
3. Validar se o template existe
```

## Monitoramento

### Verificar Eventos Kafka
```bash
# Conectar ao container Kafka
docker exec -it kafka bash

# Listar tópicos
kafka-topics.sh --list --bootstrap-server localhost:9092

# Consumir eventos
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic notification.send \
  --from-beginning
```

### Verificar Banco de Dados
```bash
# Conectar ao PostgreSQL
docker exec -it postgres psql -U postgres -d notifications_db

# Listar notificações
SELECT * FROM notifications;

# Listar preferências
SELECT * FROM notification_preferences;

# Listar device tokens
SELECT * FROM device_tokens;
```

### Verificar Logs
```bash
# Logs em tempo real
docker logs -f notifications-service
docker logs -f orchestrator
docker logs -f kafka
```

## Métricas de Sucesso

- ✓ Todos os endpoints retornam status 200/201
- ✓ Eventos são publicados no Kafka
- ✓ Notificações são criadas no banco de dados
- ✓ Preferências são salvas corretamente
- ✓ Device tokens são registrados
- ✓ Emails são enfileirados para envio
- ✓ Logs não contêm erros críticos

## Próximos Passos

1. Integrar testes com CI/CD
2. Criar testes automatizados com Jest
3. Implementar health checks
4. Adicionar métricas de performance
5. Configurar alertas para falhas

## Referências

- [Documentação de Notificações](./NOTIFICATIONS_SERVICE_SETUP.md)
- [Documentação de Integração](./NOTIFICATIONS_INTEGRATION.md)
- [Guia de Kafka](./KAFKA_INTEGRATION_COMPLETE.md)
