// Product and inventory responses from the Inventory Service (not the catalog).
export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  available_quantity: number;
  reserved_quantity: number;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reserved_quantity: number;
  updated_at: string;
}

export interface InventoryQueryParams {
  limit?: number;
  offset?: number;
}

export interface UpdateInventoryRequest {
  quantity: number;
}
