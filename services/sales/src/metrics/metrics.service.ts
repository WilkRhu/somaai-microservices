import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Gauge,
  register,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private activeConnections: Gauge;
  private kafkaMessagesPublished: Counter;
  private kafkaMessagesErrors: Counter;

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [register],
    });

    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active database connections',
      registers: [register],
    });

    this.kafkaMessagesPublished = new Counter({
      name: 'kafka_messages_published_total',
      help: 'Total Kafka messages published',
      labelNames: ['topic'],
      registers: [register],
    });

    this.kafkaMessagesErrors = new Counter({
      name: 'kafka_messages_errors_total',
      help: 'Total Kafka message publishing errors',
      labelNames: ['topic'],
      registers: [register],
    });
  }

  recordHttpRequest(method: string, route: string, status: number) {
    this.httpRequestsTotal.inc({ method, route, status });
  }

  recordHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  recordKafkaMessagePublished(topic: string) {
    this.kafkaMessagesPublished.inc({ topic });
  }

  recordKafkaMessageError(topic: string) {
    this.kafkaMessagesErrors.inc({ topic });
  }
}
