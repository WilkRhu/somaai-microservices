export class InventoryItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}
