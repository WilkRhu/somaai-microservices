import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: any) {
    const expense = this.expenseRepository.create(createExpenseDto);
    return await this.expenseRepository.save(expense);
  }

  async findAll(establishmentId: string) {
    return await this.expenseRepository.find({
      where: { establishmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    return await this.expenseRepository.findOne({ where: { id } });
  }

  async update(id: string, updateExpenseDto: any) {
    await this.expenseRepository.update(id, updateExpenseDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.expenseRepository.delete(id);
  }
}
