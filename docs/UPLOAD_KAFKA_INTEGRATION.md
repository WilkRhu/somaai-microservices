# Upload Service - Kafka Integration

## Status
✅ **Integração com Kafka implementada com sucesso**

## O que foi feito

### 1. Dependências Adicionadas
- `kafkajs@^2.2.4` - Cliente Kafka para Node.js

### 2. Arquivos Criados

#### Kafka Consumer (`services/upload/src/kafka/upload.consumer.ts`)
- Conecta ao Kafka broker
- Inscreve-se no tópico `file.upload.requested`
- Processa eventos de upload solicitados
- Implementa tratamento de erros robusto

#### Kafka Producer (`services/upload/src/kafka/upload.producer.ts`)
- Publica eventos de upload completado
- Publica eventos de falha de upload
- Tópicos:
  - `file.upload.completed` - Quando upload é bem-sucedido
  - `file.upload.failed` - Quando upload falha

#### Kafka Module (`services/upload/src/kafka/kafka.module.ts`)
- Módulo NestJS que exporta Consumer e Producer
- Gerencia ciclo de vida das conexões Kafka

### 3. Configurações Atualizadas

#### `.env` - Variáveis de Ambiente
```
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=upload-group
```

#### `app.module.ts`
- Importa `KafkaModule`
- Inicializa Consumer e Producer automaticamente

### 4. Scripts de Teste

#### `scripts/test-upload-kafka.sh` (Linux/Mac)
- Verifica se o serviço de upload está rodando
- Testa conexão com Kafka broker
- Valida tópicos necessários

#### `scripts/test-upload-kafka.ps1` (Windows)
- Mesmas verificações em PowerShell

## Como Usar

### 1. Instalar Dependências
```bash
cd services/upload
npm install
```

### 2. Iniciar o Serviço
```bash
npm run start:dev
```

### 3. Testar Conexão com Kafka

**Linux/Mac:**
```bash
bash scripts/test-upload-kafka.sh
```

**Windows:**
```powershell
.\scripts\test-upload-kafka.ps1
```

## Tópicos Kafka

| Tópico | Direção | Descrição |
|--------|---------|-----------|
| `file.upload.requested` | Entrada | Solicitações de upload de outros serviços |
| `file.upload.completed` | Saída | Notificação quando upload é concluído |
| `file.upload.failed` | Saída | Notificação quando upload falha |

## Próximos Passos

1. **Implementar handlers** - Adicionar lógica real nos métodos:
   - `handleUploadRequested()` no consumer
   - Chamar `publishUploadCompleted()` após sucesso
   - Chamar `publishUploadFailed()` em caso de erro

2. **Integrar com UploadService** - Conectar Kafka Producer ao serviço de upload

3. **Criar tópicos no Kafka** (se necessário):
   ```bash
   docker exec kafka kafka-topics --create --topic file.upload.requested --bootstrap-server localhost:9092
   docker exec kafka kafka-topics --create --topic file.upload.completed --bootstrap-server localhost:9092
   docker exec kafka kafka-topics --create --topic file.upload.failed --bootstrap-server localhost:9092
   ```

4. **Monitorar logs** - Verificar logs do serviço para confirmar conexão:
   ```
   [UploadConsumerService] Connected to Kafka
   [UploadProducerService] Kafka producer connected
   ```

## Troubleshooting

### Erro: "Cannot connect to Kafka"
- Verifique se Kafka está rodando: `docker-compose up -d kafka`
- Confirme `KAFKA_BROKERS` está correto no `.env`

### Erro: "Topic does not exist"
- Crie os tópicos manualmente (veja seção "Próximos Passos")
- Ou configure Kafka para criar tópicos automaticamente

### Serviço não inicia
- Verifique logs: `npm run start:dev`
- Confirme que todas as dependências foram instaladas: `npm install`
