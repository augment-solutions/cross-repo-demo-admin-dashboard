import { apiClient } from './client';
import type {
  Product,
  ProductsResponse,
  ProductsQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/product';

export const productsApi = {
  getProducts: async (params: ProductsQueryParams = {}): Promise<ProductsResponse> => {
    const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
      page: params.page,
      page_size: params.page_size,
      category_id: params.category_id,
      brand_id: params.brand_id,
      status: params.status,
    });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/v1/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/api/v1/products', data);
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<Product>(`/api/v1/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/products/${id}`);
  },
};

