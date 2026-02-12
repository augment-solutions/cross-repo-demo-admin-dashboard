'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { categoriesApi } from '@/services/api/categories';
import type { CreateCategoryRequest } from '@/types/category';

export default function NewCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/admin/categories');
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">New Category</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Create a new category for organizing products
          </p>
        </div>

        <div className="card p-6">
          <CategoryForm
            onSubmit={(data) => createMutation.mutate(data as CreateCategoryRequest)}
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

