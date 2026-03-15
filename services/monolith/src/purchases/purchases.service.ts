import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(PurchasesService.name);

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
   * 
   * IMPORTANTE: Usa email único baseado em UUID para evitar conflitos
   * quando múltiplas purchases são criadas antes da sincronização real.
   */
  private async ensureUserExists(userId: string): Promise<void> {
    this.logger.log(`🔍 [ENSURE USER] Checking if user ${userId} exists...`);
    const exists = await this.userSyncService.checkUserExists(userId);
    
    if (exists) {
      this.logger.log(`✅ [ENSURE USER] User ${userId} already exists`);
      return;
    }

    this.logger.log(`⚠️ [ENSURE USER] User ${userId} not found, creating placeholder...`);
    try {
      await this.userSyncService.syncUserFromAuth({
        id: userId,
        // Email único: usa o UUID como base para garantir unicidade
        // Será atualizado quando o usuário real sincronizar
        email: `placeholder-${userId}@system.local`,
        firstName: 'Pending',
        lastName: 'User',
        authProvider: 'EMAIL',
        role: 'USER',
        emailVerified: false,
      });
      this.logger.log(`✅ [ENSURE USER] Placeholder user ${userId} created successfully`);
    } catch (error) {
      // Se falhar por constraint unique, o usuário já existe
      // (pode ter sido criado por outra requisição concorrente)
      this.logger.warn(`⚠️ [ENSURE USER] Error creating placeholder user: ${error.message}`);
      const stillExists = await this.userSyncService.checkUserExists(userId);
      if (!stillExists) {
        this.logger.error(`❌ [ENSURE USER] Failed to ensure user exists: ${error.message}`);
        throw error;
      }
      this.logger.log(`✅ [ENSURE USER] User ${userId} exists (created by concurrent request)`);
    }
  }

  async createPurchase(createPurchaseDto: CreatePurchaseDto & { userId: string }): Promise<PurchaseResponseDto> {
    try {
      this.logger.log(`📝 [CREATE PURCHASE] Starting purchase creation for user: ${createPurchaseDto.userId}`);
      this.logger.log(`   - Merchant: ${createPurchaseDto.merchant}`);
      this.logger.log(`   - Amount: ${createPurchaseDto.amount}`);
      this.logger.log(`   - Type: ${createPurchaseDto.type}`);
      this.logger.log(`   - Payment Method: ${createPurchaseDto.paymentMethod}`);

      // Garantir que o usuário existe no monolith antes de qualquer operação
      this.logger.log(`🔍 [CREATE PURCHASE] Ensuring user exists in monolith...`);
      await this.ensureUserExists(createPurchaseDto.userId);
      this.logger.log(`✅ [CREATE PURCHASE] User verified in monolith`);

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
        this.logger.log(`🔄 [CREATE PURCHASE] Calling orchestrator service...`);
        const response = await firstValueFrom(
          this.httpService.post(
            `${process.env.ORCHESTRATOR_SERVICE_URL}/api/business/sales`,
            saleData,
          ),
        );

        this.logger.log(`✅ [CREATE PURCHASE] Orchestrator response received`);

        // Transformar a resposta do orquestrador em PurchaseResponseDto
        const sale = response.data;
        
        // Salvar no banco de dados
        this.logger.log(`💾 [CREATE PURCHASE] Saving purchase to database...`);
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
        this.logger.log(`✅ [CREATE PURCHASE] Purchase saved with ID: ${savedPurchase.id}`);

        // Salvar itens se existirem
        if (sale.items && sale.items.length > 0) {
          this.logger.log(`📦 [CREATE PURCHASE] Saving ${sale.items.length} purchase items...`);
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
          this.logger.log(`✅ [CREATE PURCHASE] Purchase items saved`);
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
        this.logger.log(`📤 [CREATE PURCHASE] Publishing Kafka event...`);
        await this.kafkaService.publishPurchaseCreated(purchaseResponse);
        this.logger.log(`✅ [CREATE PURCHASE] Kafka event published`);

        this.logger.log(`🎉 [CREATE PURCHASE] Purchase creation completed successfully`);
        return purchaseResponse;
      } catch (orchestratorError) {
        this.logger.warn(`⚠️ [CREATE PURCHASE] Orchestrator call failed: ${orchestratorError.message}. Saving to database directly.`);
        
        // Se o orquestrador falhar, salvar diretamente no banco
        this.logger.log(`💾 [CREATE PURCHASE] Saving purchase directly to database (fallback)...`);
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
        this.logger.log(`✅ [CREATE PURCHASE] Purchase saved (fallback) with ID: ${savedPurchase.id}`);

        // Salvar itens se existirem
        if (createPurchaseDto.items && createPurchaseDto.items.length > 0) {
          this.logger.log(`📦 [CREATE PURCHASE] Saving ${createPurchaseDto.items.length} purchase items (fallback)...`);
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
          this.logger.log(`✅ [CREATE PURCHASE] Purchase items saved (fallback)`);
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
        this.logger.log(`📤 [CREATE PURCHASE] Publishing Kafka event (fallback)...`);
        await this.kafkaService.publishPurchaseCreated(purchaseResponse);
        this.logger.log(`✅ [CREATE PURCHASE] Kafka event published (fallback)`);

        this.logger.log(`🎉 [CREATE PURCHASE] Purchase creation completed (fallback)`);
        return purchaseResponse;
      }
    } catch (error) {
      this.logger.error(`❌ [CREATE PURCHASE] Error creating purchase: ${error.message}`);
      this.logger.error(`   - Stack: ${error.stack}`);
      throw new HttpException(
        `Failed to create purchase: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async listPurchases(userId: string, skip: number = 0, take: number = 20): Promise<any> {
    this.logger.log(`📋 [LIST PURCHASES] Fetching purchases for user: ${userId}`);
    this.logger.log(`   - Skip: ${skip}, Take: ${take}`);

    try {
      const [items, total] = await this.purchaseRepository.findAndCount({
        where: { userId },
        skip: Number(skip),
        take: Number(take),
        relations: ['items'],
        order: { purchasedAt: 'DESC' },
      });

      this.logger.log(`✅ [LIST PURCHASES] Found ${total} purchases (showing ${items.length})`);

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
    } catch (error) {
      this.logger.error(`❌ [LIST PURCHASES] Error fetching purchases: ${error.message}`);
      this.logger.error(`   - Stack: ${error.stack}`);
      throw error;
    }
  }

  async getPurchaseSummary(userId: string): Promise<PurchaseSummaryDto> {
    this.logger.log(`📊 [GET SUMMARY] Fetching purchase summary for user: ${userId}`);

    try {
      const purchases = await this.purchaseRepository.find({
        where: { userId },
        order: { purchasedAt: 'DESC' },
      });

      this.logger.log(`✅ [GET SUMMARY] Found ${purchases.length} purchases`);

      const totalSpent = purchases.reduce((sum, p) => sum + Number(p.totalAmount), 0);

      const summary = {
        totalSpent,
        averageSpent: purchases.length > 0 ? totalSpent / purchases.length : 0,
        totalPurchases: purchases.length,
        lastPurchaseDate: purchases[0]?.purchasedAt,
        topMerchant: purchases[0]?.merchant,
        topCategory: 'Alimentos',
      };

      this.logger.log(`   - Total Spent: ${totalSpent}`);
      this.logger.log(`   - Total Purchases: ${purchases.length}`);

      return summary;
    } catch (error) {
      this.logger.error(`❌ [GET SUMMARY] Error fetching summary: ${error.message}`);
      this.logger.error(`   - Stack: ${error.stack}`);
      throw error;
    }
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

  /**
   * Cria uma purchase a partir de uma imagem de recibo (OCR + Purchase)
   * Integra com o serviço OCR para extrair dados do recibo
   */
  async createPurchaseFromReceipt(
    userId: string,
    receiptData: any,
  ): Promise<PurchaseResponseDto> {
    try {
      this.logger.log(`📸 [CREATE FROM RECEIPT] Starting receipt processing for user: ${userId}`);
      this.logger.log(`   - Receipt data keys: ${Object.keys(receiptData).join(', ')}`);

      // Garantir que o usuário existe
      this.logger.log(`🔍 [CREATE FROM RECEIPT] Ensuring user exists...`);
      await this.ensureUserExists(userId);
      this.logger.log(`✅ [CREATE FROM RECEIPT] User verified`);

      // Se houver imagem, processar com OCR
      let extractedData = receiptData;
      if (receiptData.image || receiptData.imageBase64) {
        this.logger.log(`🔄 [CREATE FROM RECEIPT] Image detected, would process with OCR (TODO)`);
        // TODO: Integrar com OCR service para extrair dados da imagem
        // const ocrResult = await this.ocrService.extractReceiptData(receiptData.image);
        // extractedData = { ...receiptData, ...ocrResult };
      }

      // Criar purchase com dados extraídos
      this.logger.log(`📝 [CREATE FROM RECEIPT] Creating purchase from extracted data...`);
      const purchaseDto: CreatePurchaseDto & { userId: string } = {
        userId,
        merchant: extractedData.merchant || extractedData.storeName || 'Unknown Store',
        amount: extractedData.amount || extractedData.total || 0,
        type: extractedData.type || 'PURCHASE',
        paymentMethod: extractedData.paymentMethod || 'UNKNOWN',
        purchasedAt: extractedData.purchasedAt || new Date().toISOString(),
        description: extractedData.description || `Receipt from ${extractedData.merchant}`,
        items: extractedData.items || [],
        ocrData: {
          text: extractedData.text,
          extractedData: extractedData.extractedData,
          confidence: extractedData.confidence || 0,
          documentType: extractedData.documentType || 'receipt',
        },
      };

      this.logger.log(`   - Merchant: ${purchaseDto.merchant}`);
      this.logger.log(`   - Amount: ${purchaseDto.amount}`);
      this.logger.log(`   - Items: ${purchaseDto.items.length}`);

      return this.createPurchase(purchaseDto);
    } catch (error) {
      this.logger.error(`❌ [CREATE FROM RECEIPT] Error processing receipt: ${error.message}`);
      this.logger.error(`   - Stack: ${error.stack}`);
      throw new HttpException(
        `Failed to create purchase from receipt: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
