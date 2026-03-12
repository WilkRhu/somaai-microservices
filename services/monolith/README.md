# Monolith Core Service

Serviço core da arquitetura de microserviços SomaAI. Responsável por gerenciar usuários, estabelecimentos e subscriptions.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Docker (opcional)

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run start:dev
```

### Build

```bash
npm run build
```

### Testes

```bash
npm run test
npm run test:cov
npm run test:e2e
```

## 🐳 Docker

### Build

```bash
docker build -t somaai-monolith-service .
```

### Run

```bash
docker-compose up -d
```

## 📡 Endpoints

### Usuários

- `GET /api/users/:id` - Obter usuário por ID
- `PATCH /api/users/:id` - Atualizar usuário
- `GET /api/users/profile/me` - Obter perfil do usuário atual

### Estabelecimentos

- `POST /api/establishments` - Criar estabelecimento
- `GET /api/establishments/:id` - Obter estabelecimento
- `GET /api/establishments` - Listar estabelecimentos do usuário
- `PATCH /api/establishments/:id` - Atualizar estabelecimento

### Subscriptions

- `POST /api/subscriptions` - Criar subscription
- `GET /api/subscriptions/:id` - Obter subscription
- `GET /api/subscriptions` - Listar subscriptions do usuário
- `PATCH /api/subscriptions/:id` - Atualizar subscription
- `DELETE /api/subscriptions/:id` - Cancelar subscription

## 🔐 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

## 📚 Documentação

- [Arquitetura](../../docs/ARCHITECTURE.md)
- [Guia de Implementação](../../docs/IMPLEMENTATION_GUIDE.md)

## 📝 Licença

Proprietary - SomaAI
