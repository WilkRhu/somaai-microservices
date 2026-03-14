import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { OcrService } from '../ocr/ocr.service';
import { OcrProducerService } from './ocr.producer';

@Injectable()
export class OcrConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private consumer!: Consumer;
  private readonly logger = new Logger(OcrConsumerService.name);

  constructor(
    private ocrService: OcrService,
    private ocrProducerService: OcrProducerService,
  ) {}

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'ocr-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'ocr-group',
    });

    await this.consumer.connect();
    await this.subscribeToTopics();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async subscribeToTopics() {
    await this.consumer.subscribe({ topic: 'order.created' });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const data = JSON.parse(message.value?.toString() || '{}');
          this.logger.log(`Received message from topic ${topic}: ${JSON.stringify(data)}`);

          if (topic === 'order.created') {
            await this.handleOrderCreated(data);
          }
        } catch (error) {
          this.logger.error(`Error processing message: ${error instanceof Error ? error.message : String(error)}`);
        }
      },
    });
  }

  private async handleOrderCreated(order: any) {
    try {
      this.logger.log(`Processing OCR for order: ${order.id}`);

      // Se o pedido contém uma imagem base64, processar com OCR
      if (order.receiptImage || order.image || order.imageBase64) {
        const imageData = order.receiptImage || order.image || order.imageBase64;
        
        const ocrResult = await this.ocrService.extractBase64({
          imageBase64: imageData,
          documentType: order.documentType || 'receipt',
          language: order.language || 'por',
        });

        // Publicar resultado do OCR
        await this.ocrProducerService.publishProcessingCompleted({
          processingId: `ocr-${order.id}`,
          orderId: order.id,
          extractedData: ocrResult.extractedData,
          text: ocrResult.text,
          confidence: ocrResult.confidence,
          documentType: ocrResult.documentType,
          status: 'completed',
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`OCR processing completed for order: ${order.id}`);
      } else {
        this.logger.warn(`No image data found in order: ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Error processing OCR for order ${order.id}: ${error instanceof Error ? error.message : String(error)}`);
      
      // Publicar falha
      await this.ocrProducerService.publishProcessingFailed({
        processingId: `ocr-${order.id}`,
        orderId: order.id,
        error: error instanceof Error ? error.message : String(error),
        status: 'failed',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
