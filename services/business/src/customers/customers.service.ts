import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Customer } from './entities/customer.entity';
import { KafkaProducerService } from '../shared/kafka/kafka-producer.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';

  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private readonly httpService: HttpService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  private async uploadAvatar(base64: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.uploadServiceUrl}/upload`, { base64, folder: 'customers' }),
      );
      return response.data.url;
    } catch {
      return base64; // fallback: salva o base64 se upload falhar
    }
  }

  async create(createCustomerDto: any) {
    if (createCustomerDto.avatar?.startsWith('data:')) {
      createCustomerDto.avatar = await this.uploadAvatar(createCustomerDto.avatar);
    }
    const customer: Customer = this.customersRepository.create(createCustomerDto) as unknown as Customer;
    const saved: Customer = await this.customersRepository.save(customer) as unknown as Customer;

    if (saved.email) {
      try {
        await this.kafkaProducerService.publishEvent('notification.email.send', {
          to: saved.email,
          subject: 'Bem-vindo!',
          template: 'customer-welcome',
          data: {
            name: saved.name,
            establishmentName: createCustomerDto.establishmentName,
          },
        });
      } catch (error) {
        this.logger.warn(`Falha ao enviar email de boas-vindas para cliente: ${error.message}`);
      }
    }

    return saved;
  }

  async findAll() {
    return this.customersRepository.find();
  }

  async findOne(id: string) {
    return this.customersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateCustomerDto: any) {
    if (updateCustomerDto.avatar?.startsWith('data:')) {
      updateCustomerDto.avatar = await this.uploadAvatar(updateCustomerDto.avatar);
    }
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

  async findByEstablishment(establishmentId: string) {
    return this.customersRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
  }
}
