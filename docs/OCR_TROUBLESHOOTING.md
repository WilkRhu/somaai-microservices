# OCR Extract Base64 - Troubleshooting

## Erro: AggregateError no Orchestrador

### Causa
O erro `AggregateError` indica que o orchestrador não conseguiu conectar ao serviço OCR ou o serviço OCR não está respondendo.

### Soluções

#### 1. Verificar se o serviço OCR está rodando
```bash
# Verificar se a porta 3007 está aberta
netstat -an | grep 3007

# Ou testar a conexão
curl http://localhost:3007/health
```

#### 2. Verificar a configuração do `.env` do orchestrador
Certifique-se de que `OCR_SERVICE_URL` está configurado:
```
OCR_SERVICE_URL=http://localhost:3007
```

#### 3. Verificar logs do serviço OCR
```bash
# Se rodando localmente
cd services/ocr
npm run start:dev

# Ou verificar logs do Docker
docker logs ocr-service
```

#### 4. Testar a rota diretamente no serviço OCR
```bash
curl -X POST http://localhost:3007/api/ocr/extract-base64 \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "documentType": "receipt",
    "language": "por"
  }'
```

#### 5. Usar o script de teste
```bash
# Linux/Mac
bash scripts/test-ocr-extract.sh

# Windows PowerShell
.\scripts\test-ocr-extract.ps1
```

## Possíveis Problemas

### Problema: Serviço OCR não está rodando
**Solução:**
```bash
cd services/ocr
npm install
npm run start:dev
```

### Problema: Porta 3007 já está em uso
**Solução:**
```bash
# Encontrar o processo usando a porta
lsof -i :3007

# Matar o processo
kill -9 <PID>

# Ou mudar a porta no .env
PORT=3008
```

### Problema: Erro de conexão com banco de dados no OCR
**Solução:**
Verificar as credenciais do banco de dados em `services/ocr/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=ocr_db
```

### Problema: Timeout na requisição
**Solução:**
Aumentar o timeout no orchestrador (já foi aumentado para 30s):
```typescript
timeout: 30000, // 30 segundos
```

## Fluxo de Requisição

```
Cliente
  ↓
Orchestrador (3009) - /api/monolith/ocr/extract-base64
  ↓
OCR Service (3007) - /api/ocr/extract-base64
  ↓
Tesseract (OCR Engine)
  ↓
Resposta com texto e dados extraídos
```

## Variáveis de Ambiente Necessárias

### Orchestrador (.env)
```
OCR_SERVICE_URL=http://localhost:3007
```

### Serviço OCR (.env)
```
PORT=3007
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=ocr_db
KAFKA_BROKERS=localhost:9092
JWT_SECRET=your-secret-key
```

## Verificação de Saúde

### Health Check do Orchestrador
```bash
curl http://localhost:3009/health
```

### Health Check do OCR Service
```bash
curl http://localhost:3007/health
```

## Logs Úteis

### Orchestrador
```bash
# Ver logs em tempo real
docker logs -f orchestrator-service

# Ou se rodando localmente
npm run start:dev
```

### OCR Service
```bash
# Ver logs em tempo real
docker logs -f ocr-service

# Ou se rodando localmente
npm run start:dev
```

## Próximos Passos

1. Certifique-se de que todos os serviços estão rodando
2. Verifique as variáveis de ambiente
3. Teste a rota diretamente no serviço OCR
4. Verifique os logs para mensagens de erro específicas
5. Use o script de teste para validar todas as rotas
