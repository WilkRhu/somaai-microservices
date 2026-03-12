import { Controller, Post, Get, Patch, Param, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { EstablishmentResponseDto } from './dto/establishment-response.dto';

@ApiTags('Establishments')
@ApiBearerAuth('access-token')
@Controller('api/establishments')
export class EstablishmentsController {
  constructor(private establishmentsService: EstablishmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new establishment' })
  @ApiResponse({
    status: 201,
    description: 'Establishment created',
    type: EstablishmentResponseDto,
  })
  async create(
    @Body() createEstablishmentDto: CreateEstablishmentDto,
    @Request() req: any,
  ): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.create(req.user?.id, createEstablishmentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get establishment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Establishment found',
    type: EstablishmentResponseDto,
  })
  async findById(@Param('id') id: string): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all establishments for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of establishments',
    type: [EstablishmentResponseDto],
  })
  async findByUser(@Request() req: any): Promise<EstablishmentResponseDto[]> {
    return this.establishmentsService.findByUserId(req.user?.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update establishment' })
  @ApiResponse({
    status: 200,
    description: 'Establishment updated',
    type: EstablishmentResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateEstablishmentDto>,
  ): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.update(id, updateData);
  }
}
