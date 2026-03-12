# Auth Service

Serviço de autenticação para a arquitetura de microserviços SomaAI.

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
docker build -t somaai-auth-service .
```

### Run

```bash
docker-compose up -d
```

## 📡 Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Obter usuário atual (requer JWT)
- `POST /api/auth/verify-token` - Verificar token (requer JWT)

## 🔐 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

## 📚 Documentação

- [Arquitetura](../../docs/ARCHITECTURE.md)
- [Guia de Implementação](../../docs/IMPLEMENTATION_GUIDE.md)

## 📝 Licença

Proprietary - SomaAI
