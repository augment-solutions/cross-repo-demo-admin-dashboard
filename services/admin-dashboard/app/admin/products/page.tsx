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
import { productsApi } from '@/services/api/products';
import type { Product } from '@/types/product';

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => productsApi.getProducts({ page, page_size: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteProduct(null);
    },
  });

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (product: Product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-secondary-500 text-xs">{product.sku}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (product: Product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product: Product) => (
        <span className={product.stock < 10 ? 'text-error-600 font-medium' : ''}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Product) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            product.status === 'active'
              ? 'bg-success-50 text-success-600'
              : product.status === 'draft'
              ? 'bg-warning-50 text-warning-600'
              : 'bg-secondary-100 text-secondary-600'
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/products/${product.id}/edit`);
            }}
            className="p-1 text-secondary-500 hover:text-primary-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteProduct(product);
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
            <h1 className="text-2xl font-bold text-secondary-900">Products</h1>
            <p className="mt-1 text-sm text-secondary-500">
              Manage your product catalog
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={data?.items || []}
          keyExtractor={(product) => product.id}
          onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
          isLoading={isLoading}
          emptyMessage="No products found. Create your first product!"
        />

        {data && data.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}

        <ConfirmDialog
          open={!!deleteProduct}
          onOpenChange={(open) => !open && setDeleteProduct(null)}
          title="Delete Product"
          description={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteProduct && deleteMutation.mutate(deleteProduct.id)}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

