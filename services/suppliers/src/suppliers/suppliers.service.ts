import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { SuppliersProducerService } from '../kafka/suppliers.producer';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(SupplierEntity)
    private supplierRepository: Repository<SupplierEntity>,
    private suppliersProducer: SuppliersProducerService,
  ) {}

  async createSupplier(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    try {
      const supplier = this.supplierRepository.create({
        name: dto.name,
        cnpj: dto.cnpj,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
      });

      await this.supplierRepository.save(supplier);

      await this.suppliersProducer.publishSupplierCreated({
        id: supplier.id,
        name: supplier.name,
        cnpj: supplier.cnpj,
      });

      return this.mapToDto(supplier);
    } catch (error) {
      throw new HttpException(
        `Failed to create supplier: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getSupplierById(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
    }

    return this.mapToDto(supplier);
  }

  async listSuppliers(name?: string): Promise<SupplierResponseDto[]> {
    const query = this.supplierRepository.createQueryBuilder('supplier');

    if (name) {
      query.where('supplier.name LIKE :name', { name: `%${name}%` });
    }

    const suppliers = await query.orderBy('supplier.createdAt', 'DESC').getMany();

    return suppliers.map((supplier) => this.mapToDto(supplier));
  }

  async updateSupplier(id: string, dto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(supplier, dto);
    await this.supplierRepository.save(supplier);

    await this.suppliersProducer.publishSupplierUpdated({
      id: supplier.id,
      name: supplier.name,
      cnpj: supplier.cnpj,
    });

    return this.mapToDto(supplier);
  }

  async deleteSupplier(id: string): Promise<void> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
    }

    await this.supplierRepository.remove(supplier);

    await this.suppliersProducer.publishSupplierDeleted({
      id: supplier.id,
      name: supplier.name,
    });
  }

  private mapToDto(supplier: SupplierEntity): SupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      cnpj: supplier.cnpj,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }
}
