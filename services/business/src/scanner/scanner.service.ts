import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { ScanPayloadDto } from './dto/scan-payload.dto';
import { ScanResultDto, ProductDataDto } from './dto/scan-result.dto';

@Injectable()
export class ScannerService {
  private logger = new Logger('ScannerService');
  private scanCache = new Map<string, { data: ProductDataDto; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async processScan(payload: ScanPayloadDto): Promise<ScanResultDto> {
    try {
      // Valida o barcode
      if (!payload.barcode || payload.barcode.trim().length === 0) {
        return {
          success: false,
          barcode: payload.barcode,
          timestamp: payload.timestamp,
          product: null,
          error: 'Barcode inválido',
        };
      }

      // Verifica cache
      const cached = this.scanCache.get(payload.barcode);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        this.logger.log(`Produto encontrado em cache: ${payload.barcode}`);
        return {
          success: true,
          barcode: payload.barcode,
          timestamp: payload.timestamp,
          product: cached.data,
        };
      }

      // Busca no banco de dados
      const product = await this.findProductByBarcode(payload.barcode);

      if (product) {
        const productData = this.mapProductToDto(product);
        
        // Armazena em cache
        this.scanCache.set(payload.barcode, {
          data: productData,
          timestamp: Date.now(),
        });

        return {
          success: true,
          barcode: payload.barcode,
          timestamp: payload.timestamp,
          product: productData,
        };
      }

      return {
        success: false,
        barcode: payload.barcode,
        timestamp: payload.timestamp,
        product: null,
      };
    } catch (error) {
      this.logger.error(`Erro ao processar scan: ${error.message}`);
      throw error;
    }
  }

  private async findProductByBarcode(barcode: string): Promise<InventoryItem | null> {
    return this.inventoryRepository.findOne({
      where: { barcode },
    });
  }

  private mapProductToDto(product: InventoryItem): ProductDataDto {
    return {
      normalizedName: product.name,
      originalName: product.name,
      brand: product.brand,
      category: product.category,
      unit: product.unit,
      weightKg: undefined,
      unitsPerPackage: undefined,
      averagePrice: product.salePrice?.toString() || '0',
      purchaseCount: 0,
    };
  }

  // Limpa cache periodicamente
  clearExpiredCache() {
    const now = Date.now();
    for (const [barcode, cached] of this.scanCache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.scanCache.delete(barcode);
      }
    }
  }

  // Limpa todo o cache
  clearAllCache() {
    this.scanCache.clear();
    this.logger.log('Cache de scanner limpo');
  }
}
