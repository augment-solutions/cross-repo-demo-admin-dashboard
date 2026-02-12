import { apiClient } from './client';
import type {
  Category,
  CategoriesResponse,
  CategoriesQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';

export const categoriesApi = {
  getCategories: async (params: CategoriesQueryParams = {}): Promise<CategoriesResponse> => {
    const response = await apiClient.get<CategoriesResponse>('/api/v1/categories', {
      page: params.page,
      page_size: params.page_size,
    });
    return response.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(`/api/v1/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/api/v1/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await apiClient.put<Category>(`/api/v1/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/categories/${id}`);
  },
};

