import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseResponseDto, PurchaseSummaryDto } from './dto/purchase-response.dto';
import { KafkaService } from '../kafka/kafka.service';
import { Purchase } from './entities/purchase.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { UserSyncService } from '../users/services/user-sync.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private purchaseItemRepository: Repository<PurchaseItem>,
    private httpService: HttpService,
    private kafkaService: KafkaService,
    private userSyncService: UserSyncService,
  ) {}

  /**
   * Garante que o usuário existe no monolith antes de criar a purchase.
   * Se não existir, cria um registro mínimo para satisfazer a FK.
   */
  private async ensureUserExists(userId: string): Promise<void> {
    const exists = await this.userSyncService.checkUserExists(userId);
    if (!exists) {
      await this.userSyncService.syncUserFromAuth({
        id: userId,
        email: `${userId}@placeholder.local`,
        firstName: 'User',
        lastName: userId.substring(0, 8),
        authProvider: 'EMAIL',
        role: 'USER',
        emailVerified: false,
      });
    }
  }

  async createPurchase(createPurchaseDto: CreatePurchaseDto & { userId: string }): Promise<PurchaseResponseDto> {
    try {
      // Garantir que o usuário existe no monolith antes de qualquer operação
      await this.ensureUserExists(createPurchaseDto.userId);
      const saleData = {
        userId: createPurchaseDto.userId,
        type: createPurchaseDto.type,
        merchant: createPurchaseDto.merchant,
        description: createPurchaseDto.description || `Purchase from ${createPurchaseDto.merchant}`,
        amount: createPurchaseDto.amount,
        paymentMethod: createPurchaseDto.paymentMethod,
        purchasedAt: createPurchaseDto.purchasedAt,
        items: createPurchaseDto.items || createPurchaseDto.products || [],
        installments: createPurchaseDto.installments || 1,
      };

      try {
        // Tentar fazer requisição para o orquestrador
        const response = await firstValueFrom(
          this.httpService.post(
            `${process.env.ORCHESTRATOR_SERVICE_URL}/api/business/sales`,
            saleData,
          ),
        );

        // Transformar a resposta do orquestrador em PurchaseResponseDto
        const sale = response.data;
        
        // Salvar no banco de dados
        const purchase = this.purchaseRepository.create({
          id: sale.id,
          userId: sale.userId,
          type: sale.type,
          merchant: sale.merchant,
          description: sale.description,
          totalAmount: sale.amount,
          paymentMethod: sale.paymentMethod,
          purchasedAt: new Date(sale.purchasedAt),
          installments: sale.installments || 1,
          status: 'COMPLETED',
          ocrData: createPurchaseDto.ocrData || null,
        });

        const savedPurchase = await this.purchaseRepository.save(purchase);

        // Salvar itens se existirem
        if (sale.items && sale.items.length > 0) {
          const items = sale.items.map((item: any) =>
            this.purchaseItemRepository.create({
              purchaseId: savedPurchase.id,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: (item.quantity * item.unitPrice),
            }),
          );
          await this.purchaseItemRepository.save(items);
        }

        const purchaseResponse: PurchaseResponseDto = {
          id: savedPurchase.id,
          userId: savedPurchase.userId,
          type: savedPurchase.type,
          merchant: savedPurchase.merchant,
          description: savedPurchase.description,
          amount: savedPurchase.totalAmount,
          paymentMethod: savedPurchase.paymentMethod,
          purchasedAt: savedPurchase.purchasedAt,
          items: sale.items || [],
          products: sale.items || [],
          installments: savedPurchase.installments,
          ocrData: savedPurchase.ocrData,
          createdAt: savedPurchase.createdAt,
          updatedAt: savedPurchase.updatedAt,
        };

        // Publicar evento no Kafka para notificar outros serviços
        await this.kafkaService.publishPurchaseCreated(purchaseResponse);

        return purchaseResponse;
      } catch (orchestratorError) {
        console.warn(`Orchestrator call failed: ${orchestratorError.message}. Saving to database directly.`);
        
        // Se o orquestrador falhar, salvar diretamente no banco
        const purchase = this.purchaseRepository.create({
          userId: createPurchaseDto.userId,
          type: createPurchaseDto.type,
          merchant: createPurchaseDto.merchant,
          description: createPurchaseDto.description || `Purchase from ${createPurchaseDto.merchant}`,
          totalAmount: createPurchaseDto.amount,
          paymentMethod: createPurchaseDto.paymentMethod,
          purchasedAt: new Date(createPurchaseDto.purchasedAt),
          installments: createPurchaseDto.installments || 1,
          status: 'COMPLETED',
          ocrData: createPurchaseDto.ocrData || null,
        });

        const savedPurchase = await this.purchaseRepository.save(purchase);

        // Salvar itens se existirem
        if (createPurchaseDto.items && createPurchaseDto.items.length > 0) {
          const items = createPurchaseDto.items.map((item) =>
            this.purchaseItemRepository.create({
              purchaseId: savedPurchase.id,
              productName: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: (item.quantity * item.unitPrice),
            }),
          );
          await this.purchaseItemRepository.save(items);
        }

        const purchaseResponse: PurchaseResponseDto = {
          id: savedPurchase.id,
          userId: savedPurchase.userId,
          type: savedPurchase.type,
          merchant: savedPurchase.merchant,
          description: savedPurchase.description,
          amount: savedPurchase.totalAmount,
          paymentMethod: savedPurchase.paymentMethod,
          purchasedAt: savedPurchase.purchasedAt,
          items: createPurchaseDto.items || [],
          products: createPurchaseDto.products || [],
          installments: savedPurchase.installments,
          ocrData: savedPurchase.ocrData,
          createdAt: savedPurchase.createdAt,
          updatedAt: savedPurchase.updatedAt,
        };

        // Publicar evento no Kafka mesmo assim
        await this.kafkaService.publishPurchaseCreated(purchaseResponse);

        return purchaseResponse;
      }
    } catch (error) {
      throw new HttpException(
        `Failed to create purchase: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async listPurchases(userId: string, skip: number = 0, take: number = 20): Promise<any> {
    const [items, total] = await this.purchaseRepository.findAndCount({
      where: { userId },
      skip: Number(skip),
      take: Number(take),
      relations: ['items'],
      order: { purchasedAt: 'DESC' },
    });

    return {
      items: items.map((p) => ({
        id: p.id,
        userId: p.userId,
        type: p.type,
        merchant: p.merchant,
        description: p.description,
        amount: p.totalAmount,
        paymentMethod: p.paymentMethod,
        purchasedAt: p.purchasedAt,
        items: p.items,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      total,
      skip,
      take,
    };
  }

  async getPurchaseSummary(userId: string): Promise<PurchaseSummaryDto> {
    const purchases = await this.purchaseRepository.find({
      where: { userId },
      order: { purchasedAt: 'DESC' },
    });

    const totalSpent = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);

    return {
      totalSpent,
      averageSpent: purchases.length > 0 ? totalSpent / purchases.length : 0,
      totalPurchases: purchases.length,
      lastPurchaseDate: purchases[0]?.purchasedAt,
      topMerchant: purchases[0]?.merchant,
      topCategory: 'Alimentos',
    };
  }

  async getPurchaseById(userId: string, purchaseId: string): Promise<PurchaseResponseDto> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId, userId },
      relations: ['items'],
    });

    if (!purchase) {
      return null;
    }

    return {
      id: purchase.id,
      userId: purchase.userId,
      type: purchase.type,
      merchant: purchase.merchant,
      description: purchase.description,
      amount: purchase.totalAmount,
      paymentMethod: purchase.paymentMethod,
      purchasedAt: purchase.purchasedAt,
      items: purchase.items,
      ocrData: purchase.ocrData,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }

  async updatePurchase(
    userId: string,
    purchaseId: string,
    updateData: any,
  ): Promise<PurchaseResponseDto> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId, userId },
      relations: ['items'],
    });

    if (!purchase) {
      throw new HttpException('Purchase not found', HttpStatus.NOT_FOUND);
    }

    Object.assign(purchase, updateData);
    const updated = await this.purchaseRepository.save(purchase);

    return {
      id: updated.id,
      userId: updated.userId,
      type: updated.type,
      merchant: updated.merchant,
      description: updated.description,
      amount: updated.totalAmount,
      paymentMethod: updated.paymentMethod,
      purchasedAt: updated.purchasedAt,
      items: updated.items,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deletePurchase(userId: string, purchaseId: string): Promise<void> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId, userId },
    });

    if (!purchase) {
      throw new HttpException('Purchase not found', HttpStatus.NOT_FOUND);
    }

    await this.purchaseRepository.remove(purchase);
  }
}
