export class ProductResponseDto {
  id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  image?: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}
