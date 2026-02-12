'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { productsApi } from '@/services/api/products';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productsApi.getProduct(params.id as string),
  });

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.deleteProduct(params.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/admin/products');
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

  if (error || !product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-error-600">Product not found</p>
          <Link href="/admin/products" className="btn-secondary mt-4">
            Back to Products
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
            href="/admin/products"
            className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-secondary-900">{product.name}</h1>
            <div className="flex gap-2">
              <Link
                href={`/admin/products/${product.id}/edit`}
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
              <h3 className="text-sm font-medium text-secondary-500">SKU</h3>
              <p className="mt-1 text-secondary-900">{product.sku}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Status</h3>
              <span
                className={`inline-flex mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                  product.status === 'active'
                    ? 'bg-success-50 text-success-600'
                    : product.status === 'draft'
                    ? 'bg-warning-50 text-warning-600'
                    : 'bg-secondary-100 text-secondary-600'
                }`}
              >
                {product.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Price</h3>
              <p className="mt-1 text-secondary-900">${product.price.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-500">Stock</h3>
              <p className={`mt-1 ${product.stock < 10 ? 'text-error-600' : 'text-secondary-900'}`}>
                {product.stock} units
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-secondary-500">Description</h3>
            <p className="mt-1 text-secondary-900">{product.description}</p>
          </div>
          <div className="text-xs text-secondary-400 border-t pt-4">
            <p>Created: {new Date(product.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(product.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Delete Product"
          description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => deleteMutation.mutate()}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}

