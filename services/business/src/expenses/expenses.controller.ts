import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';

@Controller('api/expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() createExpenseDto: any) {
    return await this.expensesService.create(createExpenseDto);
  }

  @Get()
  async findAll(@Query('establishmentId') establishmentId: string) {
    return await this.expensesService.findAll(establishmentId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.expensesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateExpenseDto: any) {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.expensesService.remove(id);
    return { success: true };
  }
}
