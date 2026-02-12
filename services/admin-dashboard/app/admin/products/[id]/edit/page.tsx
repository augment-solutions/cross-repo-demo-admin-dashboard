'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/products/ProductForm';
import { productsApi } from '@/services/api/products';
import type { UpdateProductRequest } from '@/types/product';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productsApi.getProduct(params.id as string),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductRequest) =>
      productsApi.updateProduct(params.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', params.id] });
      router.push(`/admin/products/${params.id}`);
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
        <Link
          href={`/admin/products/${params.id}`}
          className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Product
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Edit Product</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Update product information
          </p>
        </div>

        <div className="card p-6">
          <ProductForm
            product={product}
            onSubmit={(data) => updateMutation.mutate(data as UpdateProductRequest)}
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

