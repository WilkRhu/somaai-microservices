# SomaAI Microservices

Plataforma de microserviços para gerenciamento de vendas, inventário, entrega e operações fiscais.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Iniciar todos os serviços
./scripts/start-all-services.ps1  # Windows
./scripts/start-all-services.sh   # Linux/Mac

# Rodar testes
npm run test
```

## 📚 Documentação

Toda a documentação está em `/docs`:

- **[START_HERE.md](docs/START_HERE.md)** - Comece aqui! Setup em 10 minutos
- **[IMPLEMENTATION_PROGRESS.md](docs/IMPLEMENTATION_PROGRESS.md)** - Status do projeto
- **[NEXT_PRIORITIES.md](docs/NEXT_PRIORITIES.md)** - Próximas prioridades
- **[WHAT_IS_MISSING_UPDATED.md](docs/WHAT_IS_MISSING_UPDATED.md)** - O que ainda falta

## 📊 Status do Projeto

```
Phase 1 (Fundação)    ████████████████████ 100% ✅
Phase 2 (Qualidade)   ███████████░░░░░░░░░░  75% ✅⏳
Phase 3 (Features)    ░░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 4 (Polish)      ░░░░░░░░░░░░░░░░░░░░░   0% ⏳

OVERALL               ███████████░░░░░░░░░░  80%
```

## 🏗️ Arquitetura

```
Frontend (Port 3000)
        ↓
Orchestrator (Port 3009)
        ↓
┌───────┬───────┬───────┐
│       │       │       │
Auth    Monolith Business
3010    3001    3011
│       │       │
└───────┴───────┴───────┘
        ↓
      MySQL
```

## 🔑 Serviços

- **Auth** - Autenticação JWT e Google OAuth
- **Monolith** - Usuários e Produtos
- **Business** - Operações de negócio
- **Orchestrator** - API Gateway
- **Sales** - Gerenciamento de vendas
- **Inventory** - Controle de estoque
- **Delivery** - Rastreamento de entregas
- **Suppliers** - Gerenciamento de fornecedores
- **Offers** - Promoções e ofertas
- **Fiscal** - Emissão de NFC-e
- **OCR** - Processamento de documentos
- **Payments** - Processamento de pagamentos

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e
```

## 📖 Documentação Completa

Veja a pasta `/docs` para documentação detalhada:

- Guias de setup
- Arquitetura do sistema
- Documentação de APIs
- Guias de troubleshooting
- Relatórios de progresso

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Commit suas mudanças
3. Push para a branch
4. Abra um Pull Request

## 📝 Licença

MIT

---

**Última atualização**: March 12, 2026  
**Status**: 80% Completo  
**Próximo passo**: Testes de Integração

