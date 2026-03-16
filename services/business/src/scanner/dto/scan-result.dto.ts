export class ProductDataDto {
  normalizedName: string;
  originalName: string;
  brand?: string;
  category?: string;
  unit?: string;
  weightKg?: string;
  unitsPerPackage?: number;
  averagePrice: string;
  purchaseCount: number;
}

export class ScanResultDto {
  success: boolean;
  barcode: string;
  timestamp: string;
  product: ProductDataDto | null;
  error?: string;
}
