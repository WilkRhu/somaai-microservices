import { Controller, Post, Get, Patch, Param, Body, Request } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { EstablishmentResponseDto } from './dto/establishment-response.dto';

@Controller('api/establishments')
export class EstablishmentsController {
  constructor(private establishmentsService: EstablishmentsService) {}

  @Post()
  async create(
    @Body() createEstablishmentDto: CreateEstablishmentDto,
    @Request() req,
  ): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.create(req.user?.id, createEstablishmentDto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.findById(id);
  }

  @Get()
  async findByUser(@Request() req): Promise<EstablishmentResponseDto[]> {
    return this.establishmentsService.findByUserId(req.user?.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateEstablishmentDto>,
  ): Promise<EstablishmentResponseDto> {
    return this.establishmentsService.update(id, updateData);
  }
}
