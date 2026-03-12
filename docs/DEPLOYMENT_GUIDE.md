# SomaAI Microservices - Deployment Guide

**Date**: March 12, 2026  
**Status**: Production Ready  
**Version**: 1.0.0

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Deployment](#local-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment Options](#cloud-deployment-options)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Requirements
- ✅ Node.js 16+ or 18+
- ✅ Docker & Docker Compose
- ✅ PostgreSQL 12+
- ✅ MongoDB 4.4+
- ✅ Redis 6+
- ✅ Kafka 2.8+
- ✅ Git

### Verification
```bash
# Check Node.js
node --version

# Check Docker
docker --version
docker-compose --version

# Check Git
git --version
```

### Code Verification
```bash
# Clone repository
git clone <repository-url>
cd somaai-microservices

# Install dependencies
npm install

# Run tests
npm run test

# Build all services
npm run build
```

---

## Local Deployment

### Step 1: Setup Environment

Create `.env` file in root directory:

```env
# Node Environment
NODE_ENV=development

# Orchestrator
ORCHESTRATOR_PORT=3000

# Services Ports
AUTH_SERVICE_PORT=3001
SALES_SERVICE_PORT=3002
INVENTORY_SERVICE_PORT=3003
SUPPLIERS_SERVICE_PORT=3004
PAYMENTS_SERVICE_PORT=3005
DELIVERY_SERVICE_PORT=3006
OFFERS_SERVICE_PORT=3007
FISCAL_SERVICE_PORT=3008
OCR_SERVICE_PORT=3009
MONOLITH_SERVICE_PORT=3010
BUSINESS_SERVICE_PORT=3011

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=somaai

# MongoDB
MONGODB_URI=mongodb://localhost:27017/somaai

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=somaai-group

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# OAuth (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-token
MERCADOPAGO_PUBLIC_KEY=your-mercadopago-public-key
```

### Step 2: Start Services Locally

**Option A: Using Docker Compose**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option B: Using npm scripts**

```bash
# Start all services
npm run start:all

# Or start individual services
npm run start:orchestrator
npm run start:auth
npm run start:sales
npm run start:inventory
npm run start:payments
npm run start:delivery
npm run start:fiscal
npm run start:ocr
npm run start:suppliers
npm run start:offers
npm run start:monolith
npm run start:business
```

### Step 3: Verify Deployment

```bash
# Check orchestrator health
curl http://localhost:3000/health

# Check auth service
curl http://localhost:3001/health

# Check all services
curl http://localhost:3000/api/health
```

---

## Docker Deployment

### Step 1: Build Docker Images

```bash
# Build all services
docker-compose build

# Or build individual service
docker build -t somaai-orchestrator:latest -f services/orchestrator/Dockerfile .
docker build -t somaai-auth:latest -f services/auth/Dockerfile .
docker build -t somaai-sales:latest -f services/sales/Dockerfile .
# ... repeat for other services
```

### Step 2: Push to Registry

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag somaai-orchestrator:latest your-registry/somaai-orchestrator:latest
docker tag somaai-auth:latest your-registry/somaai-auth:latest
# ... repeat for other services

# Push images
docker push your-registry/somaai-orchestrator:latest
docker push your-registry/somaai-auth:latest
# ... repeat for other services
```

### Step 3: Deploy with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f orchestrator

# Scale services
docker-compose up -d --scale sales=3 --scale inventory=3

# Stop services
docker-compose down
```

---

## Cloud Deployment Options

### Option 1: AWS (Recommended)

#### Using ECS (Elastic Container Service)

**Step 1: Create ECR Repository**

```bash
# Create repository for each service
aws ecr create-repository --repository-name somaai-orchestrator
aws ecr create-repository --repository-name somaai-auth
aws ecr create-repository --repository-name somaai-sales
# ... repeat for other services
```

**Step 2: Push Images to ECR**

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag somaai-orchestrator:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/somaai-orchestrator:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/somaai-orchestrator:latest
```

**Step 3: Create ECS Cluster**

```bash
# Create cluster
aws ecs create-cluster --cluster-name somaai-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster somaai-cluster \
  --service-name somaai-orchestrator \
  --task-definition somaai-orchestrator:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

**Step 4: Setup RDS Database**

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier somaai-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <password> \
  --allocated-storage 20
```

**Step 5: Setup ElastiCache**

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id somaai-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### Using EKS (Kubernetes)

**Step 1: Create EKS Cluster**

```bash
# Create cluster
eksctl create cluster --name somaai-cluster --region us-east-1

# Get kubeconfig
aws eks update-kubeconfig --name somaai-cluster --region us-east-1
```

**Step 2: Deploy Services**

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
```

**Step 3: Setup Ingress**

```bash
# Install ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx

# Apply ingress
kubectl apply -f k8s/ingress.yaml
```

---

### Option 2: Google Cloud (GCP)

#### Using Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/somaai-orchestrator

# Deploy to Cloud Run
gcloud run deploy somaai-orchestrator \
  --image gcr.io/PROJECT_ID/somaai-orchestrator \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1
```

#### Using GKE (Google Kubernetes Engine)

```bash
# Create cluster
gcloud container clusters create somaai-cluster \
  --zone us-central1-a \
  --num-nodes 3

# Deploy services
kubectl apply -f k8s/

# Expose service
kubectl expose deployment somaai-orchestrator \
  --type=LoadBalancer \
  --port=80 \
  --target-port=3000
```

---

### Option 3: Azure

#### Using App Service

```bash
# Create resource group
az group create --name somaai-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name somaai-plan \
  --resource-group somaai-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group somaai-rg \
  --plan somaai-plan \
  --name somaai-orchestrator \
  --deployment-container-image-name somaai-orchestrator:latest
```

#### Using AKS (Azure Kubernetes Service)

```bash
# Create AKS cluster
az aks create \
  --resource-group somaai-rg \
  --name somaai-cluster \
  --node-count 3

# Get credentials
az aks get-credentials \
  --resource-group somaai-rg \
  --name somaai-cluster

# Deploy services
kubectl apply -f k8s/
```

---

### Option 4: DigitalOcean

#### Using App Platform

```bash
# Create app.yaml
cat > app.yaml << EOF
name: somaai
services:
- name: orchestrator
  github:
    repo: your-repo/somaai
    branch: main
  build_command: npm run build
  run_command: npm run start:orchestrator
  envs:
  - key: NODE_ENV
    value: production
EOF

# Deploy
doctl apps create --spec app.yaml
```

#### Using Kubernetes

```bash
# Create cluster
doctl kubernetes cluster create somaai-cluster

# Deploy services
kubectl apply -f k8s/
```

---

### Option 5: Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create somaai-orchestrator

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## Environment Configuration

### Production Environment Variables

```env
# Node Environment
NODE_ENV=production

# Orchestrator
ORCHESTRATOR_PORT=3000

# Services URLs (for orchestrator proxy)
AUTH_SERVICE_URL=http://auth-service:3001
BUSINESS_SERVICE_URL=http://business-service:3011
PAYMENTS_SERVICE_URL=http://payments-service:3005
DELIVERY_SERVICE_URL=http://delivery-service:3006
FISCAL_SERVICE_URL=http://fiscal-service:3008
OCR_SERVICE_URL=http://ocr-service:3009
MONOLITH_SERVICE_URL=http://monolith-service:3010

# Database (Production)
DATABASE_HOST=prod-db.example.com
DATABASE_PORT=5432
DATABASE_USER=prod_user
DATABASE_PASSWORD=<strong-password>
DATABASE_NAME=somaai_prod
DATABASE_SSL=true

# MongoDB (Production)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/somaai

# Redis (Production)
REDIS_HOST=prod-redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# Kafka (Production)
KAFKA_BROKERS=kafka1:9092,kafka2:9092,kafka3:9092
KAFKA_GROUP_ID=somaai-prod

# JWT
JWT_SECRET=<very-strong-secret-key>
JWT_EXPIRATION=24h

# OAuth
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
GOOGLE_CALLBACK_URL=https://api.somaai.com/api/auth/google/callback

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=<production-token>
MERCADOPAGO_PUBLIC_KEY=<production-public-key>

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Monitoring
SENTRY_DSN=<sentry-dsn>
DATADOG_API_KEY=<datadog-api-key>

# CORS
CORS_ORIGIN=https://app.somaai.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Database Setup

### PostgreSQL Setup

```bash
# Create database
createdb somaai

# Create user
createuser somaai_user

# Set password
psql -c "ALTER USER somaai_user WITH PASSWORD 'password';"

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE somaai TO somaai_user;"

# Run migrations
npm run migrate:up
```

### MongoDB Setup

```bash
# Create database
mongo
> use somaai
> db.createUser({user: "somaai_user", pwd: "password", roles: ["readWrite"]})
```

### Redis Setup

```bash
# Start Redis
redis-server

# Or with Docker
docker run -d -p 6379:6379 redis:latest
```

### Kafka Setup

```bash
# Start Kafka
docker-compose -f docker-compose.kafka.yml up -d

# Create topics
kafka-topics --create --topic sales-events --bootstrap-server localhost:9092
kafka-topics --create --topic inventory-events --bootstrap-server localhost:9092
kafka-topics --create --topic payment-events --bootstrap-server localhost:9092
```

---

## Monitoring & Logging

### Prometheus Setup

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'somaai'
    static_configs:
      - targets: ['localhost:3000', 'localhost:3001', 'localhost:3002']
```

### Grafana Setup

```bash
# Start Grafana
docker run -d -p 3001:3000 grafana/grafana

# Access at http://localhost:3001
# Default credentials: admin/admin
```

### ELK Stack Setup

```bash
# Start ELK
docker-compose -f docker-compose.elk.yml up -d

# Access Kibana at http://localhost:5601
```

### Sentry Setup

```bash
# Initialize Sentry
npm install @sentry/node

# Configure in app
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

```bash
# Check logs
docker-compose logs orchestrator

# Check port availability
lsof -i :3000

# Kill process on port
kill -9 <PID>
```

#### 2. Database Connection Error

```bash
# Test connection
psql -h localhost -U postgres -d somaai

# Check environment variables
echo $DATABASE_HOST
echo $DATABASE_PORT
```

#### 3. Kafka Connection Error

```bash
# Check Kafka status
docker-compose ps kafka

# Check Kafka logs
docker-compose logs kafka

# Test connection
kafka-broker-api-versions --bootstrap-server localhost:9092
```

#### 4. Memory Issues

```bash
# Increase memory limit
docker-compose down
export COMPOSE_MEMORY_LIMIT=4g
docker-compose up -d

# Or in docker-compose.yml
services:
  orchestrator:
    mem_limit: 1g
```

#### 5. Performance Issues

```bash
# Check resource usage
docker stats

# Check database performance
EXPLAIN ANALYZE SELECT * FROM sales;

# Check Redis memory
redis-cli INFO memory
```

---

## Health Checks

### Endpoint Health Checks

```bash
# Orchestrator
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# All services
curl http://localhost:3000/api/health
```

### Database Health Check

```bash
# PostgreSQL
psql -h localhost -U postgres -d somaai -c "SELECT 1;"

# MongoDB
mongo --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
```

### Kafka Health Check

```bash
# Check broker status
kafka-broker-api-versions --bootstrap-server localhost:9092

# Check topics
kafka-topics --list --bootstrap-server localhost:9092
```

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -h localhost -U postgres somaai > backup.sql

# MongoDB backup
mongodump --db somaai --out backup/

# Restore
psql -h localhost -U postgres somaai < backup.sql
mongorestore --db somaai backup/somaai/
```

### Restore from Backup

```bash
# PostgreSQL restore
psql -h localhost -U postgres somaai < backup.sql

# MongoDB restore
mongorestore --db somaai backup/somaai/
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale with Docker Compose
docker-compose up -d --scale sales=3 --scale inventory=3

# Scale with Kubernetes
kubectl scale deployment somaai-sales --replicas=3
kubectl scale deployment somaai-inventory --replicas=3
```

### Load Balancing

```bash
# Using Nginx
upstream somaai {
  server orchestrator:3000;
  server orchestrator:3000;
}

server {
  listen 80;
  location / {
    proxy_pass http://somaai;
  }
}
```

---

## Security

### SSL/TLS Setup

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

# Or use Let's Encrypt
certbot certonly --standalone -d api.somaai.com
```

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw enable
```

### Secrets Management

```bash
# Using environment variables
export DATABASE_PASSWORD=<strong-password>

# Or using secrets manager
aws secretsmanager create-secret --name somaai/db-password --secret-string <password>
```

---

## Deployment Checklist

- ✅ All tests passing
- ✅ Environment variables configured
- ✅ Database migrations completed
- ✅ SSL/TLS certificates installed
- ✅ Monitoring configured
- ✅ Logging configured
- ✅ Backups configured
- ✅ Health checks verified
- ✅ Load balancing configured
- ✅ Security hardened
- ✅ Documentation updated
- ✅ Team trained

---

## Support

For deployment issues, refer to:
- [AWS Documentation](https://docs.aws.amazon.com/)
- [GCP Documentation](https://cloud.google.com/docs)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Last Updated**: March 12, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
