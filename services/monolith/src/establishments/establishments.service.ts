import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Establishment } from './entities/establishment.entity';
import { CreateEstablishmentDto } from './dto/create-establishment.dto';
import { EstablishmentResponseDto } from './dto/establishment-response.dto';

@Injectable()
export class EstablishmentsService {
  constructor(
    @InjectRepository(Establishment)
    private establishmentsRepository: Repository<Establishment>,
  ) {}

  async create(
    userId: string,
    createEstablishmentDto: CreateEstablishmentDto,
  ): Promise<EstablishmentResponseDto> {
    const establishment = this.establishmentsRepository.create({
      userId,
      ...createEstablishmentDto,
    });

    const saved = await this.establishmentsRepository.save(establishment);
    return this.mapToResponse(saved);
  }

  async findById(id: string): Promise<EstablishmentResponseDto> {
    const establishment = await this.establishmentsRepository.findOne({
      where: { id },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    return this.mapToResponse(establishment);
  }

  async findByUserId(userId: string): Promise<EstablishmentResponseDto[]> {
    const establishments = await this.establishmentsRepository.find({
      where: { userId },
    });

    return establishments.map((e) => this.mapToResponse(e));
  }

  async update(
    id: string,
    updateData: Partial<CreateEstablishmentDto>,
  ): Promise<EstablishmentResponseDto> {
    const establishment = await this.establishmentsRepository.findOne({
      where: { id },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    Object.assign(establishment, updateData);
    const updated = await this.establishmentsRepository.save(establishment);
    return this.mapToResponse(updated);
  }

  private mapToResponse(establishment: Establishment): EstablishmentResponseDto {
    return {
      id: establishment.id,
      userId: establishment.userId,
      name: establishment.name,
      cnpj: establishment.cnpj,
      email: establishment.email,
      phone: establishment.phone,
      address: establishment.address,
      city: establishment.city,
      state: establishment.state,
      zipCode: establishment.zipCode,
      logo: establishment.logo,
      isActive: establishment.isActive,
      createdAt: establishment.createdAt,
      updatedAt: establishment.updatedAt,
    };
  }
}
