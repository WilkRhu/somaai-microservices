import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { EstablishmentResponseDto } from './dto/establishment-response.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Establishments')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
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
    @CurrentUser() userId: string,
  ): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.create(userId, createEstablishmentDto);
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
  async findByUser(@CurrentUser() userId: string): Promise<EstablishmentResponseDto[]> {
    return this.establishmentsService.findByUserId(userId);
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
