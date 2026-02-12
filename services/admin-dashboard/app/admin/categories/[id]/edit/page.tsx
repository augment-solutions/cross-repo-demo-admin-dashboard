'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { categoriesApi } from '@/services/api/categories';
import type { UpdateCategoryRequest } from '@/types/category';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', params.id],
    queryFn: () => categoriesApi.getCategory(params.id as string),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      categoriesApi.updateCategory(params.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', params.id] });
      router.push(`/admin/categories/${params.id}`);
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          <div className="h-8 bg-secondary-200 rounded w-1/4" />
          <div className="h-96 bg-secondary-100 rounded" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !category) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-error-600">Category not found</p>
          <Link href="/admin/categories" className="btn-secondary mt-4">
            Back to Categories
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/admin/categories/${params.id}`}
          className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Category
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Edit Category</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Update category information
          </p>
        </div>

        <div className="card p-6">
          <CategoryForm
            category={category}
            onSubmit={(data) => updateMutation.mutate(data as UpdateCategoryRequest)}
            isLoading={updateMutation.isPending}
          />
          {updateMutation.isError && (
            <p className="mt-4 text-sm text-error-600">
              Error: {(updateMutation.error as Error).message}
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

