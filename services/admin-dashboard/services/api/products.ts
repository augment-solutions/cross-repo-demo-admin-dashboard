import { apiClient } from './client';
import type {
  Product,
  ProductsResponse,
  ProductsQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/product';

// Backend variant type from catalog-service
interface BackendVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compare_at_price?: number;
  inventory_qty?: number;
  is_default?: boolean;
}

// Backend product type from catalog-service
interface BackendProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  category_id?: string;
  brand_id?: string;
  is_featured?: boolean;
  variants?: BackendVariant[];
  media?: Array<{ id: string; url: string; alt_text?: string }>;
  created_at: string;
  updated_at: string;
}

interface BackendProductsResponse {
  items: BackendProduct[];
  total: number;
  page: number;
  page_size: number;
  totalPages: number;
}

// Transform backend product to frontend format
function transformProduct(backendProduct: BackendProduct): Product {
  // Get price from default variant or first variant
  const defaultVariant = backendProduct.variants?.find(v => v.is_default) || backendProduct.variants?.[0];
  const price = defaultVariant?.price ?? 0;
  const compareAtPrice = defaultVariant?.compare_at_price;
  // Use inventory_qty if available, otherwise default to a positive value to indicate in-stock
  // The catalog service doesn't currently populate inventory_qty from the inventory service
  const stock = defaultVariant?.inventory_qty !== undefined ? defaultVariant.inventory_qty : 100;

  // Transform media to images
  const images = backendProduct.media?.map(m => ({
    id: m.id,
    url: m.url,
    alt: m.alt_text,
  }));

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    description: backendProduct.description,
    price,
    compare_at_price: compareAtPrice,
    sku: backendProduct.sku,
    stock,
    status: backendProduct.status,
    category_id: backendProduct.category_id,
    brand_id: backendProduct.brand_id,
    images,
    is_featured: backendProduct.is_featured,
    created_at: backendProduct.created_at,
    updated_at: backendProduct.updated_at,
  };
}

export const productsApi = {
  getProducts: async (params: ProductsQueryParams = {}): Promise<ProductsResponse> => {
    const response = await apiClient.get<BackendProductsResponse>('/api/v1/products', {
      page: params.page,
      page_size: params.page_size,
      category_id: params.category_id,
      brand_id: params.brand_id,
      status: params.status,
    });

    // Transform backend products to frontend format
    const transformedItems = (response.data.items || []).map(transformProduct);

    return {
      items: transformedItems,
      total: response.data.total,
      page: response.data.page,
      page_size: response.data.page_size,
      totalPages: response.data.totalPages,
    };
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<BackendProduct>(`/api/v1/products/${id}`);
    return transformProduct(response.data);
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

