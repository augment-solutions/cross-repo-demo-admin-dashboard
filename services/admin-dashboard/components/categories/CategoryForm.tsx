'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api/categories';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  icon_url: z.string().url().optional().or(z.literal('')),
  parent_id: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => void;
  isLoading?: boolean;
}

export function CategoryForm({ category, onSubmit, isLoading }: CategoryFormProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoriesApi.getCategories({ page_size: 100 }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      image_url: category?.image_url || '',
      icon_url: category?.icon_url || '',
      parent_id: category?.parent_id || '',
      is_active: category?.is_active ?? true,
      is_featured: category?.is_featured || false,
    },
  });

  // Filter out current category from parent options
  const parentOptions = categoriesData?.data?.filter((c) => c.id !== category?.id) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-secondary-700">Name</label>
          <input
            type="text"
            {...register('name')}
            className="input-field mt-1"
            placeholder="Category name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-secondary-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field mt-1"
            placeholder="Category description (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Image URL</label>
          <input
            type="url"
            {...register('image_url')}
            className="input-field mt-1"
            placeholder="https://example.com/image.jpg"
          />
          {errors.image_url && (
            <p className="mt-1 text-sm text-error-600">{errors.image_url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Icon URL</label>
          <input
            type="url"
            {...register('icon_url')}
            className="input-field mt-1"
            placeholder="https://example.com/icon.svg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Parent Category</label>
          <select {...register('parent_id')} className="input-field mt-1">
            <option value="">None (Top-level)</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} className="rounded" />
            <span className="text-sm text-secondary-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('is_featured')} className="rounded" />
            <span className="text-sm text-secondary-700">Featured</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}

