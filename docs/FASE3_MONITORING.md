# Fase 3 - Monitoring & Logging Setup Guide

## Overview

Comprehensive monitoring and logging stack for SomaAI Microservices using ELK Stack, Prometheus, Grafana, and Winston.

## Architecture

```
Services
  ↓
Winston Logger → Logstash → Elasticsearch → Kibana
  ↓
Prometheus Metrics → Prometheus → Grafana
  ↓
Alertmanager → Slack/PagerDuty
```

## Components

### 1. ELK Stack (Elasticsearch, Logstash, Kibana)

**Elasticsearch**
- Stores logs
- Full-text search
- Aggregations
- Port: 9200

**Logstash**
- Processes logs
- Parses JSON
- Enriches data
- Port: 5000

**Kibana**
- Visualizes logs
- Creates dashboards
- Analyzes trends
- Port: 5601

### 2. Prometheus

- Collects metrics
- Time-series database
- Scrapes endpoints
- Port: 9090

### 3. Grafana

- Visualizes metrics
- Creates dashboards
- Alerts on thresholds
- Port: 3000

### 4. Alertmanager

- Manages alerts
- Routes notifications
- Deduplicates alerts
- Port: 9093

### 5. Winston Logger

- Application logging
- Multiple transports
- Log levels
- Structured logging

## Setup

### Start Monitoring Stack

```bash
docker-compose -f docker-compose-monitoring.yml up -d
```

### Verify Services

```bash
# Elasticsearch
curl http://localhost:9200/_cluster/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3000/api/health

# Kibana
curl http://localhost:5601/api/status
```

## Configuration

### Prometheus Configuration

File: `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'sales-service'
    static_configs:
      - targets: ['sales:3001']
    metrics_path: '/metrics'
```

### Alert Rules

File: `monitoring/prometheus-rules.yml`

Predefined alerts:
- Service Down
- High Error Rate
- High Latency
- High Memory Usage
- High CPU Usage
- Database Connection Pool Exhausted
- Kafka Consumer Lag
- Disk Space Running Out

### Logstash Configuration

File: `monitoring/logstash.conf`

Inputs:
- TCP (port 5000)
- UDP (port 5000)
- File logs

Filters:
- JSON parsing
- Grok patterns
- Field enrichment

Outputs:
- Elasticsearch
- Console (debug)

### Alertmanager Configuration

File: `monitoring/alertmanager.yml`

Routes:
- Default: Slack #alerts
- Critical: Slack #critical-alerts + PagerDuty
- Warning: Slack #warnings

## Accessing Dashboards

### Grafana

1. Open http://localhost:3000
2. Login: admin / admin
3. Change password
4. View dashboards

**Default Dashboards:**
- Services Overview
- Request Rate
- Error Rate
- Response Latency
- Memory Usage

### Kibana

1. Open http://localhost:5601
2. Create index pattern: `somaai-logs-*`
3. View logs
4. Create visualizations

### Prometheus

1. Open http://localhost:9090
2. Query metrics
3. View alerts
4. Check targets

## Winston Logger Integration

### Installation

```bash
npm install winston winston-elasticsearch
```

### Configuration

```typescript
import winston from 'winston';
import * as Elasticsearch from 'winston-elasticsearch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new Elasticsearch.ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://localhost:9200' },
      index: 'somaai-logs',
    }),
  ],
});
```

### Usage

```typescript
logger.info('Sale created', { saleId: 'sale-123', customerId: 'cust-123' });
logger.error('Database error', { error: err.message });
logger.warn('High latency detected', { latency: 1500 });
```

## Metrics Collection

### Application Metrics

Expose metrics endpoint:

```typescript
import { register } from 'prom-client';

@Get('/metrics')
metrics() {
  return register.metrics();
}
```

### Metrics to Track

- HTTP request count
- HTTP request duration
- HTTP error rate
- Database query duration
- Kafka message count
- Cache hit rate
- Active connections

### Example Metrics

```typescript
import { Counter, Histogram, Gauge } from 'prom-client';

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route'],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Active database connections',
});
```

## Health Check Endpoints

### Implementation

```typescript
@Get('/health')
health() {
  return {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    services: {
      database: 'connected',
      kafka: 'connected',
      cache: 'connected',
    },
  };
}

@Get('/health/ready')
readiness() {
  // Check if service is ready to accept traffic
  return { ready: true };
}

@Get('/health/live')
liveness() {
  // Check if service is alive
  return { alive: true };
}
```

## Querying Logs

### Kibana Queries

```
# All errors
level: "error"

# Specific service
service: "sales"

# Time range
@timestamp: [now-1h TO now]

# Specific error
error.message: "Database error"
```

### Prometheus Queries

```
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Latency (p95)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage
container_memory_usage_bytes{name=~".*-service"}
```

## Alerting

### Alert Conditions

Alerts trigger when:
- Service is down (2 min)
- Error rate > 5% (5 min)
- Latency p95 > 1s (5 min)
- Memory > 80% (5 min)
- CPU > 80% (5 min)
- DB connections > 80% (5 min)
- Kafka lag > 10k messages (5 min)
- Disk space < 10% (5 min)

### Notification Channels

1. **Slack**
   - #alerts: Warning alerts
   - #critical-alerts: Critical alerts

2. **PagerDuty**
   - Critical alerts only
   - Automatic incident creation

3. **Email**
   - Daily digest
   - Critical alerts

## Dashboards

### Services Overview

Displays:
- Request rate (all services)
- Error rate (gauge)
- Response latency (p95, p99)
- Memory usage (all services)

### Service-Specific Dashboards

For each service:
- Request metrics
- Error metrics
- Database metrics
- Kafka metrics

### Infrastructure Dashboard

Displays:
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- Container metrics

## Log Retention

### Elasticsearch

- Default: 30 days
- Configurable via index lifecycle management
- Older logs archived to S3

### Prometheus

- Default: 15 days
- Configurable via retention policy
- Older metrics deleted

## Performance Tuning

### Elasticsearch

```yaml
# Increase heap size
ES_JAVA_OPTS: "-Xms1g -Xmx1g"

# Increase refresh interval
index.refresh_interval: "30s"
```

### Prometheus

```yaml
# Increase storage retention
--storage.tsdb.retention.time=30d

# Increase WAL size
--storage.tsdb.wal-compression
```

### Logstash

```yaml
# Increase pipeline workers
pipeline.workers: 4

# Increase batch size
pipeline.batch.size: 500
```

## Troubleshooting

### No Logs in Kibana

1. Check Logstash is running
2. Verify Elasticsearch connection
3. Check log format
4. Verify index pattern

### No Metrics in Prometheus

1. Check service metrics endpoint
2. Verify Prometheus scrape config
3. Check service is running
4. Review Prometheus logs

### Alerts Not Firing

1. Check alert rules
2. Verify Prometheus evaluation
3. Check Alertmanager config
4. Verify notification channels

### High Memory Usage

1. Reduce log retention
2. Increase Elasticsearch heap
3. Optimize queries
4. Archive old data

## Backup & Recovery

### Elasticsearch Backup

```bash
# Create snapshot
curl -X PUT "localhost:9200/_snapshot/backup" \
  -H 'Content-Type: application/json' \
  -d '{"type": "fs", "settings": {"location": "/backup"}}'

# Restore snapshot
curl -X POST "localhost:9200/_snapshot/backup/snapshot-1/_restore"
```

### Prometheus Backup

```bash
# Backup data directory
tar -czf prometheus-backup.tar.gz /prometheus/data

# Restore
tar -xzf prometheus-backup.tar.gz -C /
```

## Security

### Elasticsearch

- Enable authentication
- Use SSL/TLS
- Restrict network access
- Enable audit logging

### Prometheus

- Restrict access to admin endpoints
- Use reverse proxy with auth
- Enable HTTPS
- Limit scrape targets

### Grafana

- Change default password
- Enable LDAP/OAuth
- Use HTTPS
- Restrict data source access

## Maintenance

### Daily

- Monitor alert frequency
- Check service health
- Review error logs

### Weekly

- Review performance trends
- Optimize slow queries
- Archive old logs

### Monthly

- Update dashboards
- Review alert rules
- Capacity planning
- Security audit

## Scaling

### Horizontal Scaling

- Multiple Elasticsearch nodes
- Multiple Prometheus instances
- Multiple Grafana instances
- Load balancer for access

### Vertical Scaling

- Increase heap size
- Increase storage
- Increase CPU
- Increase memory

## Integration with Services

### Add Metrics Endpoint

```typescript
import { register } from 'prom-client';

@Get('/metrics')
metrics() {
  return register.metrics();
}
```

### Add Health Endpoint

```typescript
@Get('/health')
health() {
  return { status: 'ok' };
}
```

### Add Winston Logger

```typescript
import { logger } from './logger';

logger.info('Service started', { port: 3001 });
```

## References

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/)
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/)
- [Winston Logger](https://github.com/winstonjs/winston)
