import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { User } from '../users/entities/user.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { ExpenseCategory } from '../expenses/enums/expense-category.enum';
import { ExpenseStatus } from '../expenses/enums/expense-status.enum';
import { PaymentMethod } from '../shared/enums/payment-method.enum';

@Injectable()
export class SuppliersService {
  private uploadServiceUrl = process.env.UPLOAD_SERVICE_URL || 'http://localhost:3008';

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly httpService: HttpService,
  ) {}

  private async uploadImage(base64: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.uploadServiceUrl}/upload`, { base64, folder: 'suppliers' }),
      );
      return response.data.url;
    } catch {
      return base64;
    }
  }

  async createSupplier(createSupplierDto: any) {
    if (createSupplierDto.image?.startsWith('data:')) {
      createSupplierDto.image = await this.uploadImage(createSupplierDto.image);
    }
    const supplier = this.supplierRepository.create(createSupplierDto);
    return await this.supplierRepository.save(supplier);
  }

  async findAllSuppliers(establishmentId: string) {
    return await this.supplierRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneSupplier(id: string) {
    return await this.supplierRepository.findOne({ where: { id } });
  }

  async updateSupplier(id: string, updateSupplierDto: any) {
    if (updateSupplierDto.image?.startsWith('data:')) {
      updateSupplierDto.image = await this.uploadImage(updateSupplierDto.image);
    }
    await this.supplierRepository.update(id, updateSupplierDto);
    return await this.findOneSupplier(id);
  }

  async removeSupplier(id: string) {
    await this.supplierRepository.delete(id);
  }

  // Purchase Orders

  async createPurchaseOrder(dto: any) {
    const items = dto.items || [];
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + (item.subtotal ?? item.quantity * item.unitPrice),
      0,
    );
    const orderNumber = `PO-${Date.now()}`;

    const purchaseOrder = this.purchaseOrderRepository.create({
      ...dto,
      orderNumber,
      totalAmount,
    });
    return await this.purchaseOrderRepository.save(purchaseOrder);
  }

  async findAllPurchaseOrders(establishmentId: string, supplierId?: string) {
    const where: any = { establishmentId };
    if (supplierId) where.supplierId = supplierId;

    const orders = await this.purchaseOrderRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return Promise.all(orders.map(async (order) => this.formatOrder(order)));
  }

  async findOnePurchaseOrder(id: string) {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return this.formatOrder(order);
  }

  async updatePurchaseOrderStatus(id: string, dto: { status: string; deliveredDate?: string; notes?: string }) {
    const order = await this.purchaseOrderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Pedido não encontrado');

    const updates: any = { status: dto.status };
    if (dto.deliveredDate) updates.deliveredDate = dto.deliveredDate;
    if (dto.notes !== undefined) updates.notes = dto.notes;

    await this.purchaseOrderRepository.update(id, updates);

    // Ao aprovar, cria despesa automaticamente
    if (dto.status === 'approved' && order.status !== 'approved') {
      const supplier = await this.supplierRepository.findOne({ where: { id: order.supplierId } });
      const expense = this.expenseRepository.create({
        id: uuidv4(),
        establishmentId: order.establishmentId,
        category: ExpenseCategory.INVENTORY_PURCHASE,
        description: `Pedido ${order.orderNumber}${supplier ? ` - ${supplier.name}` : ''}`,
        amount: order.totalAmount,
        paymentMethod: PaymentMethod.BOLETO,
        status: ExpenseStatus.PENDING,
        expenseDate: new Date(),
        dueDate: order.expectedDeliveryDate || null,
        notes: order.notes,
      });
      await this.expenseRepository.save(expense);
    }

    return this.findOnePurchaseOrder(id);
  }

  async updatePurchaseOrder(id: string, dto: any) {
    await this.purchaseOrderRepository.update(id, dto);
    return this.findOnePurchaseOrder(id);
  }

  async removePurchaseOrder(id: string) {
    await this.purchaseOrderRepository.delete(id);
  }

  private async formatOrder(order: PurchaseOrder) {
    const supplier = await this.supplierRepository.findOne({ where: { id: order.supplierId } });
    let createdBy: any = null;
    if (order.createdById) {
      const user = await this.userRepository.findOne({ where: { id: order.createdById } });
      if (user) {
        createdBy = {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        };
      }
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      supplierId: order.supplierId,
      total: Number(order.totalAmount),
      status: order.status,
      expectedDeliveryDate: order.expectedDeliveryDate,
      deliveredDate: order.deliveredDate,
      notes: order.notes,
      createdAt: order.createdAt,
      supplier: supplier ? { id: supplier.id, name: supplier.name, phone: supplier.phone } : null,
      createdBy,
      items: order.items || [],
    };
  }
}
