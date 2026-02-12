'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { categoriesApi } from '@/services/api/categories';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', params.id],
    queryFn: () => categoriesApi.getCategory(params.id as string),
  });

  const deleteMutation = useMutation({
    mutationFn: () => categoriesApi.deleteCategory(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/admin/categories');
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary-200 rounded w-1/4" />
          <div className="h-64 bg-secondary-100 rounded" />
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
        <div className="mb-6">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Categories
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary-900">{category.name}</h1>
            <div className="flex gap-2">
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="btn-secondary"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="btn-danger"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Slug</h3>
              <p className="mt-1 text-secondary-900">{category.slug}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Status</h3>
              <span
                className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                  category.is_active !== false
                    ? 'bg-success-50 text-success-600'
                    : 'bg-secondary-100 text-secondary-600'
                }`}
              >
                {category.is_active !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Products</h3>
              <p className="mt-1 text-secondary-900">{category.product_count || 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Featured</h3>
              <p className="mt-1 text-secondary-900">{category.is_featured ? 'Yes' : 'No'}</p>
            </div>
          </div>
          {category.description && (
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Description</h3>
              <p className="mt-1 text-secondary-900">{category.description}</p>
            </div>
          )}
          <div className="text-xs text-secondary-400 border-t pt-4">
            <p>Created: {new Date(category.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(category.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Category"
          description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteMutation.mutate()}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

