'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api/categories';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  compare_at_price: z.number().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  status: z.enum(['active', 'draft', 'archived']),
  category_id: z.string().optional(),
  is_featured: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void;
  isLoading?: boolean;
}

export function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories({ page_size: 100 }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      price: product?.price || 0,
      compare_at_price: product?.compare_at_price,
      sku: product?.sku || '',
      stock: product?.stock || 0,
      status: product?.status || 'draft',
      category_id: product?.category_id || '',
      is_featured: product?.is_featured || false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-secondary-700">Name</label>
          <input
            type="text"
            {...register('name')}
            className="input-field mt-1"
            placeholder="Product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-secondary-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="input-field mt-1"
            placeholder="Product description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="input-field mt-1"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-error-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Compare at Price</label>
          <input
            type="number"
            step="0.01"
            {...register('compare_at_price', { valueAsNumber: true })}
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">SKU</label>
          <input
            type="text"
            {...register('sku')}
            className="input-field mt-1"
            placeholder="SKU-001"
          />
          {errors.sku && (
            <p className="mt-1 text-sm text-error-600">{errors.sku.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Stock</label>
          <input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            className="input-field mt-1"
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-error-600">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Status</label>
          <select {...register('status')} className="input-field mt-1">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700">Category</label>
          <select {...register('category_id')} className="input-field mt-1">
            <option value="">Select category</option>
            {categoriesData?.data?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('is_featured')} className="rounded" />
            <span className="text-sm text-secondary-700">Featured product</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

