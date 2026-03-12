# Fase 3 Setup Guide

## Quick Setup Instructions

### Step 1: Install Dependencies

```bash
# Install dependencies for all services
for service in sales inventory delivery suppliers offers; do
  cd services/$service
  npm install
  cd ../..
done
```

### Step 2: Configure Environment

```bash
# Copy test environment file
cp .env.test.example .env.test

# Copy service environment files
for service in sales inventory delivery suppliers offers; do
  cp services/$service/.env.example services/$service/.env
done
```

### Step 3: Run Tests

```bash
# Run tests for all services
for service in sales inventory delivery suppliers offers; do
  cd services/$service
  npm run test:cov
  cd ../..
done

# Check coverage
echo "Coverage reports available at:"
for service in sales inventory delivery suppliers offers; do
  echo "  services/$service/coverage/index.html"
done
```

### Step 4: Start Monitoring Stack

```bash
# Start monitoring services
docker-compose -f docker-compose-monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose-monitoring.yml ps

# Check health
curl http://localhost:9200/_cluster/health
curl http://localhost:9090/-/healthy
curl http://localhost:3000/api/health
curl http://localhost:5601/api/status
```

### Step 5: Configure GitHub Actions

1. Go to GitHub repository settings
2. Add the following secrets:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token
   - `SLACK_WEBHOOK`: Your Slack webhook URL (optional)

### Step 6: Test CI/CD Pipeline

```bash
# Push to develop branch to trigger CI
git add .
git commit -m "feat: add Fase 3 testing, CI/CD, and monitoring"
git push origin develop

# Monitor workflow in GitHub Actions tab
```

## Accessing Dashboards

### Grafana
- URL: http://localhost:3000
- Username: admin
- Password: admin
- Change password on first login

### Kibana
- URL: http://localhost:5601
- Create index pattern: `somaai-logs-*`
- Start exploring logs

### Prometheus
- URL: http://localhost:9090
- Query metrics
- View alerts

## Troubleshooting

### Tests Failing

```bash
# Check test logs
cd services/sales
npm run test -- --verbose

# Run specific test
npm run test -- sales.service.spec.ts

# Check coverage
npm run test:cov
```

### Monitoring Stack Issues

```bash
# Check container status
docker-compose -f docker-compose-monitoring.yml ps

# View logs
docker-compose -f docker-compose-monitoring.yml logs elasticsearch
docker-compose -f docker-compose-monitoring.yml logs prometheus
docker-compose -f docker-compose-monitoring.yml logs grafana

# Restart services
docker-compose -f docker-compose-monitoring.yml restart
```

### GitHub Actions Issues

1. Check workflow logs in GitHub Actions tab
2. Verify secrets are configured
3. Check branch protection rules
4. Review error messages

## Next Steps

1. **Review Documentation**
   - Read FASE3_TESTING.md for testing details
   - Read FASE3_CICD.md for CI/CD details
   - Read FASE3_MONITORING.md for monitoring details

2. **Integrate with Services**
   - Add health endpoints to other services
   - Add metrics endpoints to other services
   - Configure Winston logger

3. **Configure Alerts**
   - Update alertmanager.yml with your Slack webhook
   - Configure PagerDuty integration (optional)
   - Test alert notifications

4. **Create Custom Dashboards**
   - Create service-specific dashboards in Grafana
   - Add custom metrics
   - Configure alerts

## Useful Commands

### Testing
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- sales.service.spec.ts
```

### Monitoring
```bash
# Start monitoring stack
docker-compose -f docker-compose-monitoring.yml up -d

# Stop monitoring stack
docker-compose -f docker-compose-monitoring.yml down

# View logs
docker-compose -f docker-compose-monitoring.yml logs -f

# Restart specific service
docker-compose -f docker-compose-monitoring.yml restart prometheus
```

### CI/CD
```bash
# Trigger workflow manually
gh workflow run ci.yml

# View workflow status
gh run list

# View workflow logs
gh run view <run-id> --log
```

## Support

For issues or questions:
1. Check documentation in docs/ directory
2. Review logs and error messages
3. Check GitHub Issues
4. Contact team lead

## Resources

- [FASE3_TESTING.md](./docs/FASE3_TESTING.md) - Testing guide
- [FASE3_CICD.md](./docs/FASE3_CICD.md) - CI/CD guide
- [FASE3_MONITORING.md](./docs/FASE3_MONITORING.md) - Monitoring guide
- [FASE3_COMPLETA.md](./docs/FASE3_COMPLETA.md) - Complete guide
- [INDEX.md](./docs/INDEX.md) - Documentation index
