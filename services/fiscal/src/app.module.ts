import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FiscalModule } from './fiscal/fiscal.module';
import { NfceEntity } from './fiscal/entities/nfce.entity';
import { FiscalConsumerService } from './kafka/fiscal.consumer';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'fiscal_db',
      entities: [NfceEntity],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.NODE_ENV === 'development',
    }),
    FiscalModule,
  ],
  controllers: [AppController],
  providers: [AppService, FiscalConsumerService],
})
export class AppModule {}
