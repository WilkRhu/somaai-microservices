import { Module } from '@nestjs/common';
import { UploadConsumerService } from './upload.consumer';
import { UploadProducerService } from './upload.producer';

@Module({
  providers: [UploadConsumerService, UploadProducerService],
  exports: [UploadProducerService],
})
export class KafkaModule {}
