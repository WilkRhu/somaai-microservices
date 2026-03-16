import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EstablishmentsController } from './establishments.controller';
import { EstablishmentsService } from './establishments.service';
import { Establishment } from './entities/establishment.entity';
import { EstablishmentMember } from './entities/establishment-member.entity';
import { EstablishmentUser } from '../shared/entities/establishment-user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { CommonModule } from '../common/common.module';
import { KafkaModule } from '../shared/kafka/kafka.module';
import { CustomersModule } from '../customers/customers.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SalesModule } from '../sales/sales.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { SuppliersModule } from '../suppliers/suppliers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Establishment, EstablishmentMember, EstablishmentUser, Customer, InventoryItem, Sale, Expense]), HttpModule, CommonModule, KafkaModule, CustomersModule, InventoryModule, SalesModule, ExpensesModule, SuppliersModule],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
  exports: [EstablishmentsService],
})
export class EstablishmentsModule {}
