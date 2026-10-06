import { apiClient } from './client';
import type {
  Inventory,
  InventoryProduct,
  InventoryQueryParams,
  UpdateInventoryRequest,
} from '@/types/inventory';

export const inventoryApi = {
  getProducts: async (params: InventoryQueryParams = {}): Promise<InventoryProduct[]> => {
    const response = await apiClient.get<InventoryProduct[]>('/api/v1/inventory/products', {
      limit: params.limit,
      offset: params.offset,
    });
    return response.data;
  },

  updateInventory: async (productId: string, data: UpdateInventoryRequest): Promise<Inventory> => {
    const response = await apiClient.put<Inventory>(
      `/api/v1/inventory/${encodeURIComponent(productId)}`,
      data
    );
    return response.data;
  },
};
