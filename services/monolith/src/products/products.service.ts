import { Injectable } from '@nestjs/common';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductSearchResultDto } from './dto/product-search.dto';

@Injectable()
export class ProductsService {
  // Mock data
  private mockProducts: ProductResponseDto[] = [
    {
      id: '1',
      name: 'Produto 1',
      description: 'Descrição do produto 1',
      category: 'Eletrônicos',
      brand: 'Brand A',
      price: 99.99,
      image: 'https://via.placeholder.com/300',
      rating: 4.5,
      reviews: 120,
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Produto 2',
      description: 'Descrição do produto 2',
      category: 'Eletrônicos',
      brand: 'Brand B',
      price: 149.99,
      image: 'https://via.placeholder.com/300',
      rating: 4.8,
      reviews: 250,
      inStock: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async listProducts(skip: number = 0, take: number = 20): Promise<ProductSearchResultDto> {
    return {
      items: this.mockProducts.slice(skip, skip + take),
      total: this.mockProducts.length,
      skip,
      take,
    };
  }

  async searchProducts(
    query: string,
    skip: number = 0,
    take: number = 20,
  ): Promise<ProductSearchResultDto> {
    const filtered = this.mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()),
    );

    return {
      items: filtered.slice(skip, skip + take),
      total: filtered.length,
      skip,
      take,
    };
  }

  async autocompleteProducts(query: string, limit: number = 10): Promise<string[]> {
    return this.mockProducts
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit)
      .map((p) => p.name);
  }

  async getProductsByBrand(brand: string, skip: number = 0, take: number = 20): Promise<ProductSearchResultDto> {
    const filtered = this.mockProducts.filter(
      (p) => p.brand?.toLowerCase() === brand.toLowerCase(),
    );

    return {
      items: filtered.slice(skip, skip + take),
      total: filtered.length,
      skip,
      take,
    };
  }

  async getProductsByCategory(
    category: string,
    skip: number = 0,
    take: number = 20,
  ): Promise<ProductSearchResultDto> {
    const filtered = this.mockProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase(),
    );

    return {
      items: filtered.slice(skip, skip + take),
      total: filtered.length,
      skip,
      take,
    };
  }

  async getTopProducts(limit: number = 10): Promise<ProductResponseDto[]> {
    return this.mockProducts
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }
}
