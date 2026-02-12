'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/products/ProductForm';
import { productsApi } from '@/services/api/products';
import type { CreateProductRequest } from '@/types/product';

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/admin/products');
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">New Product</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Create a new product in your catalog
          </p>
        </div>

        <div className="card p-6">
          <ProductForm
            onSubmit={(data) => createMutation.mutate(data as CreateProductRequest)}
            isLoading={createMutation.isPending}
          />
          {createMutation.isError && (
            <p className="mt-4 text-sm text-error-600">
              Error: {(createMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

