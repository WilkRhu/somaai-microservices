import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MonolithService } from './monolith.service';
import { MonolithController } from './monolith.controller';

@Module({
  imports: [HttpModule],
  controllers: [MonolithController],
  providers: [MonolithService],
  exports: [MonolithService],
})
export class MonolithModule {}
