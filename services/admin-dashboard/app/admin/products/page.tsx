'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { ProductCard } from '@ecomm/shared-ui-components';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { productsApi } from '@/services/api/products';
import type { Product } from '@/types/product';

type ViewMode = 'table' | 'grid';

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => productsApi.getProducts({ page, page_size: 12 }),
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

  const getProductBadge = (product: Product): string | undefined => {
    if (product.is_featured) return 'Featured';
    if (product.status === 'draft') return 'Draft';
    return undefined;
  };

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
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white shadow text-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${
                  viewMode === 'table'
                    ? 'bg-white shadow text-primary-600'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
                title="Table view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Link href="/admin/products/new" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-secondary-100 rounded-lg h-80" />
              ))
            ) : data?.items?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-secondary-500">
                No products found. Create your first product!
              </div>
            ) : (
              data?.items?.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.compare_at_price}
                  image={product.images?.[0]?.url || '/placeholder-product.jpg'}
                  badge={getProductBadge(product)}
                  inStock={product.stock > 0}
                  onClick={(id) => router.push(`/admin/products/${id}`)}
                />
              ))
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.items || []}
            keyExtractor={(product) => product.id}
            onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
            isLoading={isLoading}
            emptyMessage="No products found. Create your first product!"
          />
        )}

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

