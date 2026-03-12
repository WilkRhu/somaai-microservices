import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';

@Injectable()
export class SuppliersService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async createSupplier(createSupplierDto: any) {
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
    await this.supplierRepository.update(id, updateSupplierDto);
    return await this.findOneSupplier(id);
  }

  async removeSupplier(id: string) {
    await this.supplierRepository.delete(id);
  }

  async createPurchaseOrder(createPurchaseOrderDto: any) {
    const purchaseOrder = this.purchaseOrderRepository.create(
      createPurchaseOrderDto,
    );
    return await this.purchaseOrderRepository.save(purchaseOrder);
  }

  async findAllPurchaseOrders(establishmentId: string) {
    return await this.purchaseOrderRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOnePurchaseOrder(id: string) {
    return await this.purchaseOrderRepository.findOne({ where: { id } });
  }

  async updatePurchaseOrder(id: string, updatePurchaseOrderDto: any) {
    await this.purchaseOrderRepository.update(id, updatePurchaseOrderDto);
    return await this.findOnePurchaseOrder(id);
  }

  async removePurchaseOrder(id: string) {
    await this.purchaseOrderRepository.delete(id);
  }
}
