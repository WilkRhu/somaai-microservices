import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly logger = new Logger(KafkaService.name);
  private topicCallbacks: Map<string, (message: any) => Promise<void>> = new Map();
  private isInitialized = false;
  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.initialize();
  }

  async onModuleInit() {
    await this.initializationPromise;
  }

  private async initialize() {
    const maxRetries = 5;
    const retryDelay = 5000; // 5 segundos
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to initialize Kafka service (attempt ${attempt}/${maxRetries})...`);
        
        this.kafka = new Kafka({
          clientId: 'auth-service',
          brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          connectionTimeout: 10000, // 10 segundos
          requestTimeout: 30000, // 30 segundos
          retry: {
            initialRetryTime: 100,
            retries: 8,
          },
        });

        this.producer = this.kafka.producer({
          createPartitioner: () => {
            // Para evitar o warning do KafkaJS v2.0.0
            const { Partitioners } = require('kafkajs');
            return Partitioners.LegacyPartitioner;
          }
        });
        
        this.consumer = this.kafka.consumer({
          groupId: process.env.KAFKA_GROUP_ID || 'auth-group',
          sessionTimeout: 30000,
          heartbeatInterval: 3000,
          maxWaitTimeInMs: 5000,
        });

        // Tentar conectar o producer
        await this.producer.connect();
        this.logger.log('Kafka producer connected successfully');
        
        // Tentar conectar o consumer
        await this.consumer.connect();
        this.logger.log('Kafka consumer connected successfully');
        
        this.isInitialized = true;
        this.logger.log('Kafka service initialized successfully');
        return; // Sucesso, sair do loop
        
      } catch (error) {
        this.logger.error(`Kafka initialization attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === maxRetries) {
          this.logger.error(`All ${maxRetries} Kafka initialization attempts failed. Service will continue without Kafka.`);
          // Não lançar erro, permitir que o serviço continue sem Kafka
          this.isInitialized = false;
          return;
        }
        
        // Aguardar antes de tentar novamente
        this.logger.log(`Waiting ${retryDelay / 1000} seconds before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
    this.logger.log('Kafka service disconnected');
  }

  async publishEvent(topic: string, message: any) {
    // Espera pela inicialização se necessário
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    
    // Se ainda não estiver inicializado após esperar, logar e retornar
    if (!this.isInitialized) {
      this.logger.warn(`Cannot publish event to topic ${topic}: Kafka service not initialized`);
      return;
    }
    
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.id || message.userId || Date.now().toString(),
            value: JSON.stringify(message),
          },
        ],
      });
      this.logger.log(`Published event to topic ${topic}: ${JSON.stringify(message)}`);
    } catch (error) {
      this.logger.error(`Error publishing event to topic ${topic}: ${error.message}`);
      // Não lançar erro para não quebrar o fluxo da aplicação
    }
  }

  private isConsumerRunning = false;
  private subscriptionPromise: Promise<void> | null = null;

  async subscribeToTopic(topic: string, callback: (message: any) => Promise<void>) {
    // Espera pela inicialização se necessário
    if (!this.isInitialized) {
      await this.initializationPromise;
    }
    
    this.topicCallbacks.set(topic, callback);
    
    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      this.logger.log(`Subscribed to topic: ${topic}`);
      
      // Se já não está rodando, inicia o consumer
      if (!this.isConsumerRunning) {
        // Garante que apenas uma instância do consumer está rodando
        if (!this.subscriptionPromise) {
          this.subscriptionPromise = this.startConsumer();
        }
        await this.subscriptionPromise;
      }
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}: ${error.message}`);
      throw error;
    }
  }

  private async startConsumer() {
    if (this.isConsumerRunning) return;

    try {
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            this.logger.log(`Received message from topic ${topic}, partition ${partition}`);
            
            const callback = this.topicCallbacks.get(topic);
            if (callback) {
              await callback(data);
            } else {
              this.logger.warn(`No callback registered for topic: ${topic}`);
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}: ${error.message}`);
          }
        },
      });

      this.isConsumerRunning = true;
      this.logger.log('Kafka consumer started');
    } catch (error) {
      this.logger.error(`Error starting consumer: ${error.message}`);
      this.subscriptionPromise = null;
      throw error;
    }
  }

  // Métodos específicos para eventos de autenticação
  async publishUserCreated(user: any) {
    await this.publishEvent('user.created', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt || new Date().toISOString(),
    });
  }

  async publishUserUpdated(user: any) {
    await this.publishEvent('user.updated', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      updatedAt: user.updatedAt || new Date().toISOString(),
    });
  }

  async publishUserDeleted(userId: string) {
    await this.publishEvent('user.deleted', {
      id: userId,
      deletedAt: new Date().toISOString(),
    });
  }

  async publishTokenRevoked(tokenData: any) {
    await this.publishEvent('auth.token.revoked', {
      tokenId: tokenData.tokenId,
      userId: tokenData.userId,
      reason: tokenData.reason,
      revokedAt: new Date().toISOString(),
    });
  }

  async publishLoginSuccess(user: any) {
    await this.publishEvent('auth.login.success', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });
  }

  async publishLoginFailed(email: string, reason: string) {
    await this.publishEvent('auth.login.failed', {
      email,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  async publishRegistrationSuccess(user: any) {
    await this.publishEvent('auth.registration.success', {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });
  }
}