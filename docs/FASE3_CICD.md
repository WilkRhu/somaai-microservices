# Fase 3 - CI/CD Pipeline Documentation

## Overview

The CI/CD pipeline automates testing, building, and deployment of SomaAI Microservices using GitHub Actions.

## Pipeline Workflows

### 1. CI Workflow (ci.yml)

Runs on every push and pull request to `main` or `develop` branches.

**Triggers:**
- Push to main/develop
- Pull requests to main/develop

**Jobs:**

#### Unit & Integration Tests
- Runs for each service: sales, inventory, delivery, suppliers, offers
- Steps:
  1. Checkout code
  2. Setup Node.js 18
  3. Install dependencies
  4. Run linting
  5. Run tests with coverage
  6. Upload coverage to Codecov
  7. Verify 80% coverage threshold

#### Integration Tests
- Runs with MySQL and Kafka services
- Tests service interactions
- Validates Kafka producer/consumer

**Configuration:**
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### 2. Build Workflow (build.yml)

Builds Docker images after successful tests.

**Triggers:**
- Push to main/develop (if tests pass)
- Workflow run completion from CI workflow

**Jobs:**

#### Build Docker Images
- Builds for each service: sales, inventory, delivery, suppliers, offers, gateway
- Steps:
  1. Setup Docker Buildx
  2. Login to Docker Hub
  3. Extract metadata (tags, labels)
  4. Build and push image
  5. Cache layers for faster builds

#### Scan Images
- Runs Trivy vulnerability scanner
- Uploads results to GitHub Security tab
- Prevents deployment if critical vulnerabilities found

**Docker Image Naming:**
```
docker.io/username/somaai-sales:develop
docker.io/username/somaai-sales:main
docker.io/username/somaai-sales:sha-abc123
```

### 3. Deploy Workflow (deploy.yml)

Deploys to staging and production environments.

**Triggers:**
- Push to develop (staging)
- Push to main (production)
- Build workflow completion

**Jobs:**

#### Deploy to Staging
- Triggered on develop branch
- Steps:
  1. Deploy to staging environment
  2. Run smoke tests
  3. Notify Slack

#### Deploy to Production
- Triggered on main branch
- Requires manual approval
- Steps:
  1. Create GitHub deployment
  2. Deploy to production
  3. Run health checks
  4. Update deployment status
  5. Notify Slack

#### Rollback
- Triggered on production deployment failure
- Automatically rolls back to previous version
- Notifies team

## Setup Instructions

### 1. GitHub Secrets

Add these secrets to your GitHub repository:

```
DOCKER_USERNAME      # Docker Hub username
DOCKER_PASSWORD      # Docker Hub access token
SLACK_WEBHOOK        # Slack webhook URL for notifications
PAGERDUTY_SERVICE_KEY # PagerDuty integration key (optional)
```

### 2. Branch Protection Rules

Configure branch protection for `main`:

- Require status checks to pass before merging
- Require code reviews
- Dismiss stale pull request approvals
- Require branches to be up to date

### 3. Environment Configuration

Create GitHub environments:

**Staging:**
```
Name: staging
Deployment branches: develop
```

**Production:**
```
Name: production
Deployment branches: main
Required reviewers: 2
```

## Workflow Execution

### Typical Flow

1. **Developer pushes code** → CI workflow starts
2. **Tests run** → Coverage checked
3. **Tests pass** → Build workflow starts
4. **Docker images built** → Vulnerability scan
5. **Images pushed** → Deploy workflow starts
6. **Deploy to staging** → Smoke tests
7. **Manual approval** → Deploy to production
8. **Health checks** → Deployment complete

### Monitoring

View workflow status:
- GitHub Actions tab
- Commit status checks
- Pull request checks

### Logs

Access logs:
1. Go to GitHub Actions
2. Select workflow run
3. Click job
4. View step logs

## Configuration Files

### .github/workflows/ci.yml

```yaml
- Runs tests for each service
- Checks coverage (80% minimum)
- Runs integration tests
- Uploads coverage reports
```

### .github/workflows/build.yml

```yaml
- Builds Docker images
- Pushes to registry
- Scans for vulnerabilities
- Caches layers
```

### .github/workflows/deploy.yml

```yaml
- Deploys to staging
- Deploys to production
- Runs health checks
- Handles rollbacks
```

## Troubleshooting

### Tests Failing

1. Check test logs in GitHub Actions
2. Run tests locally
3. Verify mock setup
4. Check database connectivity

### Build Failing

1. Check Docker build logs
2. Verify Dockerfile
3. Check dependencies
4. Verify Docker Hub credentials

### Deployment Failing

1. Check deployment logs
2. Verify environment variables
3. Check health endpoints
4. Review rollback logs

## Best Practices

1. **Branch Strategy**
   - Use develop for staging
   - Use main for production
   - Create feature branches from develop

2. **Commit Messages**
   - Use conventional commits
   - Include issue references
   - Be descriptive

3. **Pull Requests**
   - Require code review
   - Run all checks
   - Update documentation

4. **Monitoring**
   - Monitor workflow runs
   - Check deployment status
   - Review logs regularly

## Performance Optimization

### Cache Strategy

- Node modules cached per service
- Docker layers cached
- Build time: ~5-10 minutes

### Parallel Execution

- Tests run in parallel for each service
- Reduces total pipeline time
- Improves feedback speed

### Artifact Management

- Coverage reports uploaded
- Build logs retained
- Old artifacts cleaned up

## Security

### Image Scanning

- Trivy scans all images
- Blocks deployment on critical vulnerabilities
- Reports uploaded to GitHub Security

### Secrets Management

- Secrets encrypted in GitHub
- Never logged in output
- Rotated regularly

### Access Control

- Branch protection rules
- Required approvals
- Audit logs enabled

## Notifications

### Slack Integration

Notifications sent for:
- Deployment success/failure
- Critical alerts
- Manual approvals needed

### Email Notifications

GitHub sends emails for:
- Workflow failures
- Required approvals
- Deployment status

## Rollback Procedure

### Automatic Rollback

Triggered when:
- Health checks fail
- Deployment errors occur
- Critical alerts triggered

### Manual Rollback

```bash
# Redeploy previous version
git revert <commit-hash>
git push origin main
```

## Metrics

### Pipeline Metrics

- Build time: ~5-10 minutes
- Test coverage: 80%+
- Deployment frequency: Multiple per day
- Lead time: < 1 hour
- MTTR: < 15 minutes

## Future Enhancements

- [ ] Automated performance testing
- [ ] Load testing in staging
- [ ] Canary deployments
- [ ] Blue-green deployments
- [ ] Automated rollback on metrics
- [ ] Integration with monitoring
