import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Establishment } from './entities/establishment.entity';
import { EstablishmentUser } from '../shared/entities/establishment-user.entity';
import { UserService } from '../shared/services/user.service';
import { Customer } from '../customers/entities/customer.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Expense } from '../expenses/entities/expense.entity';

@Injectable()
export class EstablishmentsService {
  private readonly logger = new Logger(EstablishmentsService.name);
  private readonly uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';

  constructor(
    @InjectRepository(Establishment)
    private establishmentsRepository: Repository<Establishment>,
    @InjectRepository(EstablishmentUser)
    private establishmentUsersRepository: Repository<EstablishmentUser>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private httpService: HttpService,
    private userService: UserService,
  ) {}

  private async uploadBase64(base64: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.uploadServiceUrl}/upload`, {
          base64,
          folder: 'establishments',
        }),
      );
      return response.data.url;
    } catch (error) {
      this.logger.error(`Failed to upload logo: ${error.message}`);
      throw new Error('Failed to upload logo to upload service');
    }
  }

  async create(createEstablishmentDto: any, userId: string) {
    try {
      this.logger.log(`Creating establishment for user: ${userId}`);

      // Ensure user exists in business DB (upsert with auth id as PK)
      await this.userService.createOrUpdate({
        id: userId,
        email: createEstablishmentDto.ownerEmail || `${userId}@unknown.com`,
        firstName: createEstablishmentDto.ownerFirstName || '',
        lastName: createEstablishmentDto.ownerLastName || '',
        role: 'business_owner',
      });

      let logoUrl: string | null = null;
      if (createEstablishmentDto.logo) {
        this.logger.log('Uploading logo to upload service...');
        logoUrl = await this.uploadBase64(createEstablishmentDto.logo);
        this.logger.log(`Logo uploaded: ${logoUrl}`);
      }

      const establishment = this.establishmentsRepository.create({
        id: uuidv4(),
        ownerId: userId,
        name: createEstablishmentDto.name,
        cnpj: createEstablishmentDto.cnpj,
        type: createEstablishmentDto.type,
        email: createEstablishmentDto.email,
        phone: createEstablishmentDto.phone,
        address: createEstablishmentDto.address,
        city: createEstablishmentDto.city,
        state: createEstablishmentDto.state,
        zipCode: createEstablishmentDto.zipCode,
        description: createEstablishmentDto.description,
        latitude: createEstablishmentDto.latitude,
        longitude: createEstablishmentDto.longitude,
        logo: logoUrl,
        isActive: true,
      });

      const savedEstablishment = await this.establishmentsRepository.save(establishment);
      this.logger.log(`Establishment created: ${savedEstablishment.id}`);

      const establishmentUser = this.establishmentUsersRepository.create({
        id: uuidv4(),
        establishmentId: savedEstablishment.id,
        userId,
        role: 'business_owner',
        status: 'ACTIVE',
        acceptedAt: new Date(),
      });

      await this.establishmentUsersRepository.save(establishmentUser);
      this.logger.log(`EstablishmentUser created with role business_owner`);

      return savedEstablishment;
    } catch (error) {
      this.logger.error(`Error creating establishment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    return this.establishmentsRepository.find();
  }

  async findOne(id: string) {
    return this.establishmentsRepository.findOne({ where: { id } });
  }

  async findByOwnerId(ownerId: string) {
    return this.establishmentsRepository.find({ where: { ownerId } });
  }

  async update(id: string, updateEstablishmentDto: any) {
    await this.establishmentsRepository.update(id, updateEstablishmentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.establishmentsRepository.delete(id);
  }

  async getLoyaltySettings(id: string) {
    const establishment = await this.findOne(id);
    if (!establishment) throw new NotFoundException('Estabelecimento não encontrado');

    const pointsPerReal = Number(establishment.loyaltyPointsPerReal);
    return {
      success: true,
      data: {
        loyaltyEnabled: establishment.loyaltyEnabled,
        loyaltyPointsPerReal: pointsPerReal,
        description: `${pointsPerReal} pontos por real gasto`,
        example: `R$ 10,00 = ${Math.floor(10 * pointsPerReal)} pontos`,
      },
    };
  }

  async getDashboard(establishmentId: string) {
    const establishment = await this.findOne(establishmentId);
    if (!establishment) throw new NotFoundException('Estabelecimento não encontrado');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(now.getDate() + 30);

    const [sales, expenses, customers, inventoryItems] = await Promise.all([
      this.salesRepository.find({ where: { establishmentId } }),
      this.expensesRepository.find({ where: { establishmentId } }),
      this.customersRepository.find({ where: { establishmentId } }),
      this.inventoryRepository.find({ where: { establishmentId, isActive: true } }),
    ]);

    const monthlySales = sales.filter(s => s.createdAt >= startOfMonth && s.createdAt <= endOfMonth);
    const totalRevenue = monthlySales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalExpenses = expenses
      .filter(e => e.expenseDate >= startOfMonth && e.expenseDate <= endOfMonth)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const lowStockItems = inventoryItems.filter(i => i.quantity <= i.minQuantity);
    const expiringItems = inventoryItems.filter(
      i => i.expirationDate && new Date(i.expirationDate) <= thirtyDaysAhead,
    );

    return {
      establishment: {
        id: establishment.id,
        name: establishment.name,
        loyaltyEnabled: establishment.loyaltyEnabled,
      },
      summary: {
        totalSalesThisMonth: monthlySales.length,
        totalRevenueThisMonth: Number(totalRevenue.toFixed(2)),
        totalExpensesThisMonth: Number(totalExpenses.toFixed(2)),
        netProfitThisMonth: Number((totalRevenue - totalExpenses).toFixed(2)),
        totalCustomers: customers.length,
        totalInventoryItems: inventoryItems.length,
        lowStockAlerts: lowStockItems.length,
        expiringAlerts: expiringItems.length,
      },
      alerts: {
        lowStock: lowStockItems.slice(0, 5).map(i => ({ id: i.id, name: i.name, quantity: i.quantity, minQuantity: i.minQuantity })),
        expiring: expiringItems.slice(0, 5).map(i => ({ id: i.id, name: i.name, expirationDate: i.expirationDate })),
      },
    };
  }

  async updateLoyaltySettings(id: string, userId: string, dto: { loyaltyEnabled?: boolean; loyaltyPointsPerReal?: number }) {
    const establishment = await this.findOne(id);
    if (!establishment) throw new NotFoundException('Estabelecimento não encontrado');
    if (establishment.ownerId !== userId) throw new ForbiddenException('Apenas o OWNER pode alterar as configurações de fidelidade');

    const updates: any = {};
    if (dto.loyaltyEnabled !== undefined) updates.loyaltyEnabled = dto.loyaltyEnabled;
    if (dto.loyaltyPointsPerReal !== undefined) updates.loyaltyPointsPerReal = dto.loyaltyPointsPerReal;

    await this.establishmentsRepository.update(id, updates);
    const updated = await this.findOne(id);

    return {
      success: true,
      data: {
        id: updated.id,
        loyaltyEnabled: updated.loyaltyEnabled,
        loyaltyPointsPerReal: Number(updated.loyaltyPointsPerReal),
      },
      message: 'Configuração de fidelidade atualizada com sucesso',
    };
  }
}
