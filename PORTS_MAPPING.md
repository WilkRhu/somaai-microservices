# Mapeamento de Portas - SomaAI Microservices

## Infraestrutura
- **Zookeeper**: 2181
- **Kafka**: 9092
- **MySQL**: 3306
- **Redis**: 6379

## Microserviços
| Serviço | Porta | Container | Descrição |
|---------|-------|-----------|-----------|
| Monolith | 3000 | monolith-service | Serviço monolítico principal |
| Sales | 3001 | sales-service | Gerenciamento de vendas |
| Inventory | 3002 | inventory-service | Gerenciamento de inventário |
| Delivery | 3003 | delivery-service | Gerenciamento de entregas |
| Suppliers | 3004 | suppliers-service | Gerenciamento de fornecedores |
| Notifications | 3005 | notifications-service | Serviço de notificações (EMAIL, SMS, PUSH) |
| Fiscal | 3006 | fiscal-service | Gerenciamento fiscal/NFe |
| OCR | 3007 | ocr-service | Processamento de OCR |
| Payments | 3008 | payments-service | Gerenciamento de pagamentos |
| Orchestrator | 3009 | orchestrator-service | Orquestrador de serviços |
| Auth | 3010 | auth-service | Autenticação e autorização |
| Business | 3011 | business-service | Gerenciamento de negócios |
| Email | 3012 | email-service | Serviço de email |
| Upload | 3013 | upload-service | Serviço de upload (S3/FTP) |
| Offers | 3014 | offers-service | Gerenciamento de ofertas |

## Notas Importantes
- ✅ Cada serviço tem uma porta única
- ✅ Notifications está na porta 3005 (padrão)
- ✅ Offers foi movido para 3014 para evitar conflito
- ✅ Todas as portas estão documentadas no docker-compose.yml
