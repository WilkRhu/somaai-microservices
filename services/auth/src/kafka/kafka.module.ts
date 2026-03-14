import { Module } from '@nestjs/common';
import { AuthConsumerService } from './auth.consumer';
import { KafkaService } from './kafka.service';

@Module({
  providers: [AuthConsumerService, KafkaService],
  exports: [AuthConsumerService, KafkaService],
})
export class KafkaModule {}