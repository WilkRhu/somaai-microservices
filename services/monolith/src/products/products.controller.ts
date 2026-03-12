import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductSearchResultDto } from './dto/product-search.dto';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({
    status: 200,
    description: 'Products list',
    type: ProductSearchResultDto,
  })
  async listProducts(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<ProductSearchResultDto> {
    return this.productsService.listProducts(skip, take);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: ProductSearchResultDto,
  })
  async searchProducts(
    @Query('q') query: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<ProductSearchResultDto> {
    return this.productsService.searchProducts(query, skip, take);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete products' })
  @ApiResponse({
    status: 200,
    description: 'Autocomplete suggestions',
    type: [String],
  })
  async autocompleteProducts(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ): Promise<string[]> {
    return this.productsService.autocompleteProducts(query, limit);
  }

  @Get('brand')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiResponse({
    status: 200,
    description: 'Products by brand',
    type: ProductSearchResultDto,
  })
  async getProductsByBrand(
    @Query('name') brand: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<ProductSearchResultDto> {
    return this.productsService.getProductsByBrand(brand, skip, take);
  }

  @Get('category')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({
    status: 200,
    description: 'Products by category',
    type: ProductSearchResultDto,
  })
  async getProductsByCategory(
    @Query('name') category: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<ProductSearchResultDto> {
    return this.productsService.getProductsByCategory(category, skip, take);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top products' })
  @ApiResponse({
    status: 200,
    description: 'Top products',
    type: [ProductResponseDto],
  })
  async getTopProducts(@Query('limit') limit: number = 10): Promise<ProductResponseDto[]> {
    return this.productsService.getTopProducts(limit);
  }
}
