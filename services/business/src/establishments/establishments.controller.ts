import { Controller, Get, Post, Body, Param, Put, Delete, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';

@ApiTags('Establishments')
@Controller('api/establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create establishment' })
  async create(@Body() createEstablishmentDto: any, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.establishmentsService.create(createEstablishmentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List establishments' })
  async findAll() {
    return this.establishmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get establishment by ID' })
  async findOne(@Param('id') id: string) {
    return this.establishmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update establishment' })
  async update(@Param('id') id: string, @Body() updateEstablishmentDto: any) {
    return this.establishmentsService.update(id, updateEstablishmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete establishment' })
  async remove(@Param('id') id: string) {
    return this.establishmentsService.remove(id);
  }
}
