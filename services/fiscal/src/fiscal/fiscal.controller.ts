import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { FiscalService } from './fiscal.service';
import { GenerateNfceDto } from './dto/generate-nfce.dto';
import { NfceResponseDto } from './dto/nfce-response.dto';

@Controller('api/fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post('nfce/generate')
  async generateNfce(@Body() dto: GenerateNfceDto): Promise<NfceResponseDto> {
    return this.fiscalService.generateNfce(dto);
  }

  @Get('nfce/:id')
  async getNfce(@Param('id') id: string): Promise<NfceResponseDto> {
    return this.fiscalService.getNfceById(id);
  }

  @Get('nfce')
  async listNfces(
    @Query('establishmentId') establishmentId: string,
  ): Promise<NfceResponseDto[]> {
    return this.fiscalService.listNfces(establishmentId);
  }

  @Post('nfce/:id/cancel')
  async cancelNfce(
    @Param('id') id: string,
    @Body('justification') justification: string,
  ): Promise<NfceResponseDto> {
    return this.fiscalService.cancelNfce(id, justification);
  }
}
