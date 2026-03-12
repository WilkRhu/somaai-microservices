# SomaAI - Quick Deployment Guide

**Choose your deployment platform and follow the steps below.**

---

## 🚀 Quick Start Options

### 1. Local Development (Fastest)
**Time**: 5 minutes  
**Cost**: Free  
**Best for**: Testing, development

### 2. Docker Compose (Recommended for Testing)
**Time**: 10 minutes  
**Cost**: Free  
**Best for**: Staging, testing

### 3. AWS (Production)
**Time**: 30 minutes  
**Cost**: $50-200/month  
**Best for**: Production, scalability

### 4. Google Cloud (Production)
**Time**: 30 minutes  
**Cost**: $50-200/month  
**Best for**: Production, Google ecosystem

### 5. Azure (Production)
**Time**: 30 minutes  
**Cost**: $50-200/month  
**Best for**: Production, Microsoft ecosystem

### 6. DigitalOcean (Budget-Friendly)
**Time**: 20 minutes  
**Cost**: $5-50/month  
**Best for**: Startups, small projects

---

## Option 1: Local Development

### Prerequisites
```bash
# Install Node.js 18+
node --version

# Install Docker
docker --version

# Install PostgreSQL
psql --version
```

### Setup (5 minutes)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd somaai-microservices

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Start databases
docker-compose up -d postgres redis kafka

# 5. Run migrations
npm run migrate:up

# 6. Start all services
npm run start:all
```

### Access Services

```
Orchestrator: http://localhost:3000
Auth: http://localhost:3001
Sales: http://localhost:3002
Inventory: http://localhost:3003
Payments: http://localhost:3005
Delivery: http://localhost:3006
Fiscal: http://localhost:3008
```

---

## Option 2: Docker Compose (Recommended)

### Prerequisites
```bash
docker --version
docker-compose --version
```

### Setup (10 minutes)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd somaai-microservices

# 2. Create .env file
cat > .env << EOF
NODE_ENV=production
DATABASE_HOST=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=somaai
REDIS_HOST=redis
KAFKA_BROKERS=kafka:9092
JWT_SECRET=your-secret-key
EOF

# 3. Build images
docker-compose build

# 4. Start all services
docker-compose up -d

# 5. Check status
docker-compose ps
```

### Access Services

```
Orchestrator: http://localhost:3000
API Docs: http://localhost:3000/api/docs
```

### Useful Commands

```bash
# View logs
docker-compose logs -f orchestrator

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v

# Scale services
docker-compose up -d --scale sales=3
```

---

## Option 3: AWS Deployment

### Prerequisites
```bash
# Install AWS CLI
aws --version

# Configure AWS credentials
aws configure
```

### Setup (30 minutes)

#### Step 1: Create ECR Repository

```bash
# Create repositories
aws ecr create-repository --repository-name somaai-orchestrator
aws ecr create-repository --repository-name somaai-auth
aws ecr create-repository --repository-name somaai-sales
# ... repeat for other services
```

#### Step 2: Build and Push Images

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t somaai-orchestrator:latest services/orchestrator/
docker tag somaai-orchestrator:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/somaai-orchestrator:latest
docker push \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/somaai-orchestrator:latest
```

#### Step 3: Create RDS Database

```bash
aws rds create-db-instance \
  --db-instance-identifier somaai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --publicly-accessible
```

#### Step 4: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name somaai-cluster

# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster somaai-cluster \
  --service-name somaai-orchestrator \
  --task-definition somaai-orchestrator:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

#### Step 5: Setup Load Balancer

```bash
aws elbv2 create-load-balancer \
  --name somaai-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

aws elbv2 create-target-group \
  --name somaai-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxx
```

### Access Application

```
Load Balancer URL: http://<ALB_DNS_NAME>
```

---

## Option 4: Google Cloud Deployment

### Prerequisites
```bash
# Install Google Cloud SDK
gcloud --version

# Authenticate
gcloud auth login

# Set project
gcloud config set project PROJECT_ID
```

### Setup (30 minutes)

#### Step 1: Build and Push to Container Registry

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/somaai-orchestrator

# Or build locally and push
docker build -t gcr.io/PROJECT_ID/somaai-orchestrator:latest .
docker push gcr.io/PROJECT_ID/somaai-orchestrator:latest
```

#### Step 2: Create Cloud SQL Instance

```bash
gcloud sql instances create somaai-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1
```

#### Step 3: Create GKE Cluster

```bash
# Create cluster
gcloud container clusters create somaai-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type n1-standard-1

# Get credentials
gcloud container clusters get-credentials somaai-cluster \
  --zone us-central1-a
```

#### Step 4: Deploy Services

```bash
# Create namespace
kubectl create namespace somaai

# Create secrets
kubectl create secret generic db-credentials \
  --from-literal=password=<PASSWORD> \
  -n somaai

# Deploy
kubectl apply -f k8s/ -n somaai

# Check status
kubectl get pods -n somaai
```

#### Step 5: Expose Service

```bash
# Create LoadBalancer service
kubectl expose deployment somaai-orchestrator \
  --type=LoadBalancer \
  --port=80 \
  --target-port=3000 \
  -n somaai

# Get external IP
kubectl get service somaai-orchestrator -n somaai
```

### Access Application

```
External IP: http://<EXTERNAL_IP>
```

---

## Option 5: Azure Deployment

### Prerequisites
```bash
# Install Azure CLI
az --version

# Login
az login
```

### Setup (30 minutes)

#### Step 1: Create Resource Group

```bash
az group create \
  --name somaai-rg \
  --location eastus
```

#### Step 2: Create Container Registry

```bash
az acr create \
  --resource-group somaai-rg \
  --name somaairegistry \
  --sku Basic

# Login to registry
az acr login --name somaairegistry

# Build and push
az acr build \
  --registry somaairegistry \
  --image somaai-orchestrator:latest \
  -f services/orchestrator/Dockerfile .
```

#### Step 3: Create AKS Cluster

```bash
az aks create \
  --resource-group somaai-rg \
  --name somaai-cluster \
  --node-count 3 \
  --vm-set-type VirtualMachineScaleSets \
  --load-balancer-sku standard

# Get credentials
az aks get-credentials \
  --resource-group somaai-rg \
  --name somaai-cluster
```

#### Step 4: Create Database

```bash
az postgres server create \
  --resource-group somaai-rg \
  --name somaai-db \
  --location eastus \
  --admin-user postgres \
  --admin-password <PASSWORD> \
  --sku-name B_Gen5_1
```

#### Step 5: Deploy Services

```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods
```

### Access Application

```
External IP: kubectl get service somaai-orchestrator
```

---

## Option 6: DigitalOcean Deployment

### Prerequisites
```bash
# Install doctl
doctl --version

# Authenticate
doctl auth init
```

### Setup (20 minutes)

#### Step 1: Create Kubernetes Cluster

```bash
doctl kubernetes cluster create somaai-cluster \
  --region nyc3 \
  --node-pool name=default count=3 size=s-2vcpu-4gb
```

#### Step 2: Get Kubeconfig

```bash
doctl kubernetes cluster kubeconfig save somaai-cluster
```

#### Step 3: Create Database

```bash
doctl databases create \
  --engine pg \
  --region nyc3 \
  --num-nodes 1 \
  somaai-db
```

#### Step 4: Deploy Services

```bash
# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods
```

#### Step 5: Create Load Balancer

```bash
kubectl expose deployment somaai-orchestrator \
  --type=LoadBalancer \
  --port=80 \
  --target-port=3000
```

### Access Application

```
External IP: kubectl get service somaai-orchestrator
```

---

## Post-Deployment Steps

### 1. Verify Services

```bash
# Check orchestrator health
curl http://<YOUR_URL>/health

# Check all services
curl http://<YOUR_URL>/api/health

# Check API docs
curl http://<YOUR_URL>/api/docs
```

### 2. Setup Monitoring

```bash
# Install Prometheus
kubectl apply -f monitoring/prometheus.yaml

# Install Grafana
kubectl apply -f monitoring/grafana.yaml

# Access Grafana
kubectl port-forward svc/grafana 3000:3000
# http://localhost:3000
```

### 3. Setup Logging

```bash
# Install ELK Stack
kubectl apply -f logging/elasticsearch.yaml
kubectl apply -f logging/kibana.yaml

# Access Kibana
kubectl port-forward svc/kibana 5601:5601
# http://localhost:5601
```

### 4. Setup Backups

```bash
# Create backup schedule
kubectl apply -f backups/backup-schedule.yaml

# Verify backups
kubectl get cronjobs
```

### 5. Setup SSL/TLS

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.11.0/cert-manager.yaml

# Create certificate
kubectl apply -f ssl/certificate.yaml
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
kubectl logs deployment/somaai-orchestrator

# Check events
kubectl describe pod <POD_NAME>

# Check resources
kubectl top nodes
kubectl top pods
```

### Database Connection Error

```bash
# Test connection
psql -h <DB_HOST> -U postgres -d somaai

# Check environment variables
kubectl get configmap
kubectl get secrets
```

### Performance Issues

```bash
# Check resource usage
kubectl top pods

# Check node status
kubectl get nodes

# Scale deployment
kubectl scale deployment somaai-orchestrator --replicas=3
```

---

## Cost Estimation

| Platform | Minimum | Recommended | Enterprise |
|----------|---------|-------------|-----------|
| Local | Free | Free | Free |
| Docker | Free | Free | Free |
| AWS | $50/mo | $150/mo | $500+/mo |
| GCP | $50/mo | $150/mo | $500+/mo |
| Azure | $50/mo | $150/mo | $500+/mo |
| DigitalOcean | $5/mo | $50/mo | $200+/mo |

---

## Recommended Setup

### For Development
- **Platform**: Local or Docker Compose
- **Time**: 5-10 minutes
- **Cost**: Free

### For Staging
- **Platform**: Docker Compose or DigitalOcean
- **Time**: 10-20 minutes
- **Cost**: Free - $50/month

### For Production
- **Platform**: AWS EKS or GCP GKE
- **Time**: 30-60 minutes
- **Cost**: $150-500/month

---

## Next Steps

1. Choose your deployment platform
2. Follow the setup steps
3. Verify services are running
4. Setup monitoring and logging
5. Configure backups
6. Setup SSL/TLS
7. Monitor performance

---

**Need Help?**
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions
- Review [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Contact support team

---

**Last Updated**: March 12, 2026  
**Version**: 1.0.0
