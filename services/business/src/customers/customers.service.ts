import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: any) {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async findAll() {
    return this.customersRepository.find();
  }

  async findOne(id: string) {
    return this.customersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCustomerDto: any) {
    await this.customersRepository.update(id, updateCustomerDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.customersRepository.delete(id);
  }

  async getLoyalty(customerId: string) {
    const customer = await this.findOne(customerId);
    if (!customer) throw new NotFoundException('Cliente não encontrado');

    return {
      customerId: customer.id,
      customerName: customer.name,
      currentPoints: customer.loyaltyPoints,
      totalEarned: customer.loyaltyPoints,
      totalRedeemed: 0,
    };
  }

  async addPoints(customerId: string, points: number) {
    const customer = await this.findOne(customerId);
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    if (!points || points < 1) throw new BadRequestException('Mínimo de 1 ponto');

    await this.customersRepository.update(customerId, {
      loyaltyPoints: customer.loyaltyPoints + points,
    });
    return this.findOne(customerId);
  }

  async redeemPoints(customerId: string, points: number) {
    const customer = await this.findOne(customerId);
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    if (customer.loyaltyPoints < points) {
      throw new BadRequestException(`Saldo insuficiente. Cliente possui ${customer.loyaltyPoints} pontos`);
    }

    await this.customersRepository.update(customerId, {
      loyaltyPoints: customer.loyaltyPoints - points,
    });
    return this.findOne(customerId);
  }
}
