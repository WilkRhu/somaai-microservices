import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MonolithSyncService } from './monolith-sync.service';

@Module({
  imports: [HttpModule],
  providers: [MonolithSyncService],
  exports: [MonolithSyncService],
})
export class ServicesModule {}
