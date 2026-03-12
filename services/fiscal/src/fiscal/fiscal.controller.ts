import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FiscalService } from './fiscal.service';
import { GenerateNfceDto } from './dto/generate-nfce.dto';
import { NfceResponseDto } from './dto/nfce-response.dto';
import { Auth } from '../common/decorators/auth.decorator';

@ApiTags('Fiscal')
@ApiBearerAuth('access-token')
@Controller('api/fiscal')
export class FiscalController {
  constructor(private readonly fiscalService: FiscalService) {}

  @Post('nfce/generate')
  @Auth()
  @ApiOperation({ summary: 'Generate NFC-e' })
  @ApiResponse({ status: 201, description: 'NFC-e generated', type: NfceResponseDto })
  async generateNfce(@Body() dto: GenerateNfceDto): Promise<NfceResponseDto> {
    return this.fiscalService.generateNfce(dto);
  }

  @Get('nfce/:id')
  @Auth()
  @ApiOperation({ summary: 'Get NFC-e by ID' })
  @ApiResponse({ status: 200, description: 'NFC-e found', type: NfceResponseDto })
  async getNfce(@Param('id') id: string): Promise<NfceResponseDto> {
    return this.fiscalService.getNfceById(id);
  }

  @Get('nfce')
  @Auth()
  @ApiOperation({ summary: 'List NFC-es' })
  @ApiResponse({ status: 200, description: 'NFC-es list', type: [NfceResponseDto] })
  async listNfces(
    @Query('establishmentId') establishmentId: string,
  ): Promise<NfceResponseDto[]> {
    return this.fiscalService.listNfces(establishmentId);
  }

  @Post('nfce/:id/cancel')
  @Auth()
  @ApiOperation({ summary: 'Cancel NFC-e' })
  @ApiResponse({ status: 200, description: 'NFC-e cancelled', type: NfceResponseDto })
  async cancelNfce(
    @Param('id') id: string,
    @Body('justification') justification: string,
  ): Promise<NfceResponseDto> {
    return this.fiscalService.cancelNfce(id, justification);
  }
}
