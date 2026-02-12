export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon_url?: string;
  parent_id?: string | null;
  level?: number;
  is_active?: boolean;
  is_featured?: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  icon_url?: string;
  parent_id?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  icon_url?: string;
  parent_id?: string | null;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  page_size: number;
}

export interface CategoriesQueryParams {
  page?: number;
  page_size?: number;
}

