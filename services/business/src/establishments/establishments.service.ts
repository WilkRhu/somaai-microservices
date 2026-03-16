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
import { KafkaProducerService } from '../shared/kafka/kafka-producer.service';

@Injectable()
export class EstablishmentsService {
  private readonly logger = new Logger(EstablishmentsService.name);
  private readonly uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3010';

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
    private kafkaProducerService: KafkaProducerService,
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

  async getSalesReport(
    establishmentId: string,
    filters: { startDate?: string; endDate?: string; status?: string },
  ) {
    const establishment = await this.findOne(establishmentId);
    if (!establishment) throw new NotFoundException('Estabelecimento não encontrado');

    const query = this.salesRepository.createQueryBuilder('sale')
      .where('sale.establishmentId = :establishmentId', { establishmentId });

    if (filters.startDate) {
      query.andWhere('sale.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      query.andWhere('sale.createdAt <= :endDate', { endDate: end });
    }
    if (filters.status) {
      query.andWhere('sale.status = :status', { status: filters.status });
    }

    query.orderBy('sale.createdAt', 'DESC');

    const sales = await query.getMany();

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discount), 0);
    const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

    const byStatus = sales.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPaymentMethod = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      summary: {
        totalSales: sales.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        averageTicket: Number(avgTicket.toFixed(2)),
        byStatus,
        byPaymentMethod,
      },
      sales: sales.map(s => ({
        id: s.id,
        saleNumber: s.saleNumber,
        total: Number(s.total),
        discount: Number(s.discount),
        subtotal: Number(s.subtotal),
        status: s.status,
        paymentMethod: s.paymentMethod,
        customerId: s.customerId,
        createdAt: s.createdAt,
      })),
    };
  }

  async getSalesDetails(
    establishmentId: string,
    filters: { startDate?: string; endDate?: string; status?: string; paymentMethod?: string; page?: number; limit?: number },
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const buildQuery = () => {
      const q = this.salesRepository.createQueryBuilder('sale')
        .where('sale.establishmentId = :establishmentId', { establishmentId });

      if (filters.startDate) {
        q.andWhere('DATE(sale.createdAt) >= :startDate', { startDate: filters.startDate });
      }
      if (filters.endDate) {
        q.andWhere('DATE(sale.createdAt) <= :endDate', { endDate: filters.endDate });
      }
      if (filters.status) {
        q.andWhere('sale.status = :status', { status: filters.status });
      }
      if (filters.paymentMethod) {
        q.andWhere('sale.paymentMethod = :paymentMethod', { paymentMethod: filters.paymentMethod });
      }
      return q.orderBy('sale.createdAt', 'DESC');
    };

    const [sales, total] = await buildQuery().skip(skip).take(limit).getManyAndCount();
    const allSales = await buildQuery().getMany();

    const totalRevenue = allSales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalDiscount = allSales.reduce((sum, s) => sum + Number(s.discount), 0);

    const pmMap = allSales.reduce((acc, s) => {
      const m = s.paymentMethod || 'unknown';
      if (!acc[m]) acc[m] = { method: m, total: 0, count: 0 };
      acc[m].total += Number(s.total);
      acc[m].count += 1;
      return acc;
    }, {} as Record<string, { method: string; total: number; count: number }>);

    return {
      summary: {
        totalSales: allSales.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalDiscount: Number(totalDiscount.toFixed(2)),
        averageTicket: allSales.length > 0 ? Number((totalRevenue / allSales.length).toFixed(2)) : 0,
        paymentMethods: Object.values(pmMap).map(p => ({
          method: p.method,
          total: Number(p.total.toFixed(2)),
          count: p.count,
        })),
      },
      data: sales.map(s => ({
        id: s.id,
        saleNumber: s.saleNumber,
        total: Number(s.total),
        discount: Number(s.discount),
        subtotal: Number(s.subtotal),
        status: s.status,
        paymentMethod: s.paymentMethod,
        customerId: s.customerId,
        createdAt: s.createdAt,
      })),
      total,
      page,
      limit,
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

  async getMembers(establishmentId: string) {
    return this.getEmployees(establishmentId);
  }

  async addMember(establishmentId: string, dto: { userId: string; role?: string }) {
    const existing = await this.establishmentUsersRepository.findOne({
      where: { establishmentId, userId: dto.userId },
    });
    if (existing) return existing;

    const link = this.establishmentUsersRepository.create({
      id: uuidv4(),
      establishmentId,
      userId: dto.userId,
      role: dto.role || 'CASHIER',
      status: 'ACTIVE',
      acceptedAt: new Date(),
    });
    return this.establishmentUsersRepository.save(link);
  }

  async removeMember(establishmentId: string, memberId: string) {
    await this.establishmentUsersRepository.delete({ id: memberId, establishmentId });
    return { success: true };
  }

  async getEmployees(establishmentId: string) {
    const links = await this.establishmentUsersRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
    if (!links.length) return [];

    return Promise.all(links.map(async (link) => {
      const user = await this.userService.findById(link.userId);
      return {
        id: link.id,
        userId: link.userId,
        roles: link.role ? [link.role] : (user?.role ? [user.role] : ['business_owner']),
        isActive: link.status === 'ACTIVE',
        createdAt: link.createdAt,
        user: user ? {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        } : null,
      };
    }));
  }

  async createEmployee(establishmentId: string, dto: any) {
    // 1. Upload avatar se vier base64
    let avatarUrl: string | null = dto.avatar || null;
    if (avatarUrl?.startsWith('data:')) {
      try {
        const uploadRes = await firstValueFrom(
          this.httpService.post(`${this.uploadServiceUrl}/upload`, { base64: avatarUrl, folder: 'employees' }),
        );
        avatarUrl = uploadRes.data.url;
      } catch {
        avatarUrl = null;
      }
    }

    // 2. Cria usuário no auth service
    const [firstName, ...rest] = (dto.name || '').split(' ');
    const lastName = rest.join(' ') || '';
    let authUser: any;
    try {
      const authRes = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/api/auth/register`, {
          email: dto.email,
          password: dto.password,
          firstName,
          lastName,
          phone: dto.phone,
          userType: 'business',
        }),
      );
      authUser = authRes.data?.user || authRes.data;
    } catch (err) {
      throw new Error(`Erro ao criar usuário no auth service: ${err?.response?.data?.message || err.message}`);
    }

    // 3. Sincroniza no business DB
    await this.userService.createOrUpdate({
      id: authUser.id,
      email: authUser.email,
      firstName,
      lastName,
      phone: dto.phone,
      avatar: avatarUrl,
      role: dto.roles?.[0] || 'business_sales',
    });

    // 4. Vincula ao estabelecimento
    let link = await this.establishmentUsersRepository.findOne({
      where: { establishmentId, userId: authUser.id },
    });
    if (!link) {
      link = this.establishmentUsersRepository.create({
        id: uuidv4(),
        establishmentId,
        userId: authUser.id,
        role: dto.roles?.[0] || 'business_sales',
        status: 'ACTIVE',
        acceptedAt: new Date(),
      });
      link = await this.establishmentUsersRepository.save(link);
    }

    // 5. Envia email de boas-vindas ao funcionário
    try {
      await this.kafkaProducerService.publishEvent('notification.email.send', {
        to: authUser.email,
        subject: 'Bem-vindo à equipe!',
        template: 'employee-welcome',
        data: {
          name: dto.name,
          email: authUser.email,
          password: dto.password,
          establishmentName: dto.establishmentName,
        },
      });
    } catch (error) {
      this.logger.warn(`Falha ao enviar email de boas-vindas ao funcionário: ${error.message}`);
    }

    return {
      id: link.id,
      userId: authUser.id,
      roles: dto.roles || ['business_sales'],
      isActive: link.status === 'ACTIVE',
      createdAt: link.createdAt,
      user: {
        id: authUser.id,
        name: dto.name,
        email: authUser.email,
        phone: dto.phone,
        avatar: avatarUrl,
      },
    };
  }

  async removeEmployee(establishmentId: string, userId: string) {
    await this.establishmentUsersRepository.delete({ establishmentId, userId });
    return { success: true };
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
