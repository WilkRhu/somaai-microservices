import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createExpenseDto: any) {
    const expense = this.expenseRepository.create(createExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async findAll(
    establishmentId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      category?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.expenseRepository.createQueryBuilder('expense')
      .where('expense.establishmentId = :establishmentId', { establishmentId })
      .orderBy('expense.expenseDate', 'DESC')
      .skip(skip)
      .take(limit);

    if (filters?.startDate) {
      query.andWhere('expense.expenseDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters?.endDate) {
      query.andWhere('expense.expenseDate <= :endDate', { endDate: filters.endDate });
    }
    if (filters?.category) {
      query.andWhere('expense.category = :category', { category: filters.category });
    }
    if (filters?.status) {
      query.andWhere('expense.status = :status', { status: filters.status });
    }

    const [expenses, total] = await query.getManyAndCount();

    const data = await Promise.all(expenses.map(async (expense) => {
      let creator: any = null;
      if (expense.createdById) {
        const user = await this.userRepository.findOne({ where: { id: expense.createdById } });
        if (user) {
          creator = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() };
        }
      }

      let supplier: any = null;
      if (expense.supplierId) {
        const s = await this.supplierRepository.findOne({ where: { id: expense.supplierId } });
        if (s) supplier = { id: s.id, name: s.name, phone: s.phone };
      }

      return {
        id: expense.id,
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        status: expense.status,
        expenseDate: expense.expenseDate,
        dueDate: expense.dueDate,
        paymentDate: expense.paymentDate,
        paymentMethod: expense.paymentMethod,
        isRecurring: expense.isRecurring,
        recurrenceInterval: expense.recurrenceInterval,
        notes: expense.notes,
        supplierId: expense.supplierId || null,
        supplier,
        creator,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      };
    }));

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return await this.expenseRepository.findOne({ where: { id } });
  }

  async update(id: string, updateExpenseDto: any) {
    await this.expenseRepository.update(id, updateExpenseDto);
    return await this.findOne(id);
  }

  async markAsPaid(id: string, paymentDate?: string, paymentMethod?: string) {
    const updates: any = {
      status: 'paid',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    };
    if (paymentMethod) updates.paymentMethod = paymentMethod;
    await this.expenseRepository.update(id, updates);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.expenseRepository.delete(id);
  }

  async getFinancialBalance(
    establishmentId: string,
    filters: { startDate?: string; endDate?: string },
  ) {
    const expenseQuery = this.expenseRepository.createQueryBuilder('expense')
      .where('expense.establishmentId = :establishmentId', { establishmentId })
      .andWhere('expense.status != :cancelled', { cancelled: 'cancelled' });

    if (filters.startDate) {
      expenseQuery.andWhere('expense.expenseDate >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      expenseQuery.andWhere('expense.expenseDate <= :endDate', { endDate: filters.endDate });
    }

    const expenses = await expenseQuery.getMany();

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + Number(e.amount), 0);

    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      period: { startDate: filters.startDate, endDate: filters.endDate },
      expenses: {
        total: Number(totalExpenses.toFixed(2)),
        paid: Number(paidExpenses.toFixed(2)),
        pending: Number(pendingExpenses.toFixed(2)),
        count: expenses.length,
        byCategory,
      },
    };
  }
}
