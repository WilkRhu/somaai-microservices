import { Controller, Post, Body } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { ScanPayloadDto } from './dto/scan-payload.dto';
import { ScanResultDto } from './dto/scan-result.dto';

@Controller('scanner')
export class ScannerController {
  constructor(private scannerService: ScannerService) {}

  @Post('process')
  async processScan(@Body() payload: ScanPayloadDto): Promise<ScanResultDto> {
    return this.scannerService.processScan(payload);
  }
}
