export class ProductSearchDto {
  query: string;
  skip?: number;
  take?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class ProductSearchResultDto {
  items: any[];
  total: number;
  skip: number;
  take: number;
}
