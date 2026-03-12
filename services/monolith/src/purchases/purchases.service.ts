import { Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseResponseDto, PurchaseSummaryDto } from './dto/purchase-response.dto';

@Injectable()
export class PurchasesService {
  // Mock data
  private mockPurchases: PurchaseResponseDto[] = [
    {
      id: '1',
      userId: 'user-1',
      merchant: 'Supermercado XYZ',
      description: 'Compra de alimentos',
      amount: 150.50,
      paymentMethod: 'pix',
      purchasedAt: new Date('2024-03-10'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user-1',
      merchant: 'Farmácia ABC',
      description: 'Medicamentos',
      amount: 89.90,
      paymentMethod: 'card',
      purchasedAt: new Date('2024-03-09'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async createPurchase(createPurchaseDto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    const purchase: PurchaseResponseDto = {
      id: Math.random().toString(36).substr(2, 9),
      ...createPurchaseDto,
      purchasedAt: new Date(createPurchaseDto.purchasedAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.mockPurchases.push(purchase);
    return purchase;
  }

  async listPurchases(userId: string, skip: number = 0, take: number = 20): Promise<any> {
    const userPurchases = this.mockPurchases.filter((p) => p.userId === userId);

    return {
      items: userPurchases.slice(skip, skip + take),
      total: userPurchases.length,
      skip,
      take,
    };
  }

  async getPurchaseSummary(userId: string): Promise<PurchaseSummaryDto> {
    const userPurchases = this.mockPurchases.filter((p) => p.userId === userId);
    const totalSpent = userPurchases.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalSpent,
      averageSpent: userPurchases.length > 0 ? totalSpent / userPurchases.length : 0,
      totalPurchases: userPurchases.length,
      lastPurchaseDate: userPurchases[0]?.purchasedAt,
      topMerchant: userPurchases[0]?.merchant,
      topCategory: 'Alimentos',
    };
  }

  async getPurchaseById(userId: string, purchaseId: string): Promise<PurchaseResponseDto> {
    return this.mockPurchases.find(
      (p) => p.id === purchaseId && p.userId === userId,
    ) || null;
  }

  async updatePurchase(
    userId: string,
    purchaseId: string,
    updateData: any,
  ): Promise<PurchaseResponseDto> {
    const purchase = this.mockPurchases.find(
      (p) => p.id === purchaseId && p.userId === userId,
    );

    if (purchase) {
      Object.assign(purchase, updateData, { updatedAt: new Date() });
    }

    return purchase;
  }

  async deletePurchase(userId: string, purchaseId: string): Promise<void> {
    const index = this.mockPurchases.findIndex(
      (p) => p.id === purchaseId && p.userId === userId,
    );

    if (index > -1) {
      this.mockPurchases.splice(index, 1);
    }
  }
}
