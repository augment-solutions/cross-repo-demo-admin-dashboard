export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  category_id?: string;
  brand_id?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  stock: number;
  status?: 'active' | 'draft' | 'archived';
  category_id?: string;
  brand_id?: string;
  is_featured?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compare_at_price?: number;
  sku?: string;
  stock?: number;
  status?: 'active' | 'draft' | 'archived';
  category_id?: string;
  brand_id?: string;
  is_featured?: boolean;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  totalPages: number;
}

export interface ProductsQueryParams {
  page?: number;
  page_size?: number;
  category_id?: string;
  brand_id?: string;
  status?: string;
}

