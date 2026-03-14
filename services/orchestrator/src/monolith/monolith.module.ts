import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MonolithController } from './monolith.controller';
import { MonolithService } from './monolith.service';

@Module({
  imports: [HttpModule],
  controllers: [MonolithController],
  providers: [MonolithService],
})
export class MonolithModule {}
