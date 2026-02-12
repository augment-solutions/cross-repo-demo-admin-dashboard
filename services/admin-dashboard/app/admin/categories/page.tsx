'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { categoriesApi } from '@/services/api/categories';
import type { Category } from '@/types/category';

export default function CategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['categories', page],
    queryFn: () => categoriesApi.getCategories({ page, page_size: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteCategory(null);
    },
  });

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (category: Category) => (
        <div>
          <div className="font-medium">{category.name}</div>
          <div className="text-secondary-500 text-xs">{category.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (category: Category) => (
        <span className="text-secondary-600 line-clamp-1">
          {category.description || '-'}
        </span>
      ),
    },
    {
      key: 'product_count',
      header: 'Products',
      render: (category: Category) => category.product_count || 0,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (category: Category) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            category.is_active !== false
              ? 'bg-success-50 text-success-600'
              : 'bg-secondary-100 text-secondary-600'
          }`}
        >
          {category.is_active !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/categories/${category.id}/edit`);
            }}
            className="p-1 text-secondary-500 hover:text-primary-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteCategory(category);
            }}
            className="p-1 text-secondary-500 hover:text-error-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Categories</h1>
            <p className="mt-1 text-sm text-secondary-500">
              Organize your product catalog with categories
            </p>
          </div>
          <Link href="/admin/categories/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          keyExtractor={(category) => category.id}
          onRowClick={(category) => router.push(`/admin/categories/${category.id}`)}
          isLoading={isLoading}
          emptyMessage="No categories found. Create your first category!"
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        <ConfirmDialog
          open={!!deleteCategory}
          onOpenChange={(open) => !open && setDeleteCategory(null)}
          title="Delete Category"
          description={`Are you sure you want to delete "${deleteCategory?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteCategory && deleteMutation.mutate(deleteCategory.id)}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

