import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FiscalService } from './fiscal.service';

@ApiTags('Fiscal')
@Controller('api/fiscal')
export class FiscalController {
  constructor(private fiscalService: FiscalService) {}

  @Post('nfce')
  @ApiOperation({ summary: 'Generate NFC-e' })
  async generateNfce(@Body() data: any) {
    return this.fiscalService.generateNfce(data);
  }

  @Get('nfce/:id')
  @ApiOperation({ summary: 'Get NFC-e' })
  async getNfce(@Param('id') id: string) {
    return this.fiscalService.getNfce(id);
  }

  @Get('nfce')
  @ApiOperation({ summary: 'List NFC-es' })
  async listNfces(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.fiscalService.listNfces(skip, take);
  }

  @Post('nfce/:id/cancel')
  @ApiOperation({ summary: 'Cancel NFC-e' })
  async cancelNfce(@Param('id') id: string, @Body() data: any) {
    return this.fiscalService.cancelNfce(id, data);
  }

  @Post('nfce/:id/sign')
  @ApiOperation({ summary: 'Sign NFC-e' })
  async signNfce(@Param('id') id: string, @Body() data: any) {
    return this.fiscalService.signNfce(id, data);
  }

  @Post('nfce/:id/authorize')
  @ApiOperation({ summary: 'Authorize NFC-e' })
  async authorizeNfce(@Param('id') id: string) {
    return this.fiscalService.authorizeNfce(id);
  }
}
