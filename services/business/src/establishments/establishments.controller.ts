import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';

@ApiTags('Establishments')
@Controller('api/establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create establishment' })
  @ApiResponse({ status: 201, description: 'Establishment created' })
  async create(@Body() createEstablishmentDto: any) {
    return this.establishmentsService.create(createEstablishmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List establishments' })
  @ApiResponse({ status: 200, description: 'Establishments list' })
  async findAll() {
    return this.establishmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get establishment by ID' })
  @ApiResponse({ status: 200, description: 'Establishment found' })
  async findOne(@Param('id') id: string) {
    return this.establishmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update establishment' })
  @ApiResponse({ status: 200, description: 'Establishment updated' })
  async update(@Param('id') id: string, @Body() updateEstablishmentDto: any) {
    return this.establishmentsService.update(id, updateEstablishmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete establishment' })
  @ApiResponse({ status: 200, description: 'Establishment deleted' })
  async remove(@Param('id') id: string) {
    return this.establishmentsService.remove(id);
  }
}
