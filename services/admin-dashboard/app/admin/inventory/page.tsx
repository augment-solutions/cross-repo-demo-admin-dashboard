'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/common/DataTable';
import { StockForm } from '@/components/inventory/StockForm';
import { inventoryApi } from '@/services/api/inventory';
import { getStockStatus, LOW_STOCK_THRESHOLD } from '@/lib/inventory';
import type { InventoryProduct, UpdateInventoryRequest } from '@/types/inventory';

const PAGE_SIZE = 20;

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['inventory', page],
    queryFn: () => inventoryApi.getProducts({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, values }: { productId: string; values: UpdateInventoryRequest }) =>
      inventoryApi.updateInventory(productId, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
      setSelectedProduct(null);
      setSuccessMessage('Stock updated successfully.');
    },
  });

  const columns = [
    { key: 'name', header: 'Product' },
    { key: 'sku', header: 'SKU' },
    {
      key: 'total_quantity',
      header: 'Total stock',
      render: (product: InventoryProduct) => product.available_quantity + product.reserved_quantity,
    },
    { key: 'reserved_quantity', header: 'Reserved' },
    { key: 'available_quantity', header: 'Available' },
    {
      key: 'status',
      header: 'Status',
      render: (product: InventoryProduct) => (
        <span className={clsx(
          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
          product.available_quantity <= 0
            ? 'bg-error-50 text-error-600'
            : product.available_quantity < LOW_STOCK_THRESHOLD
            ? 'bg-warning-50 text-warning-600'
            : 'bg-success-50 text-success-600'
        )}>
          {getStockStatus(product.available_quantity)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: InventoryProduct) => (
        <button
          type="button"
          className="btn-secondary"
          aria-label={`Update stock for ${product.name}`}
          disabled={updateMutation.isPending}
          onClick={() => {
            updateMutation.reset();
            setSuccessMessage('');
            setSelectedProduct(product);
          }}
        >
          Update stock
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Inventory</h1>
            <p className="mt-1 text-sm text-secondary-500">
              Manage stock levels and reservations. Low stock means fewer than {LOW_STOCK_THRESHOLD} available units.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching || updateMutation.isPending}
            className="btn-secondary"
          >
            <RefreshCw className={clsx('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {successMessage && <p role="status" className="text-sm text-success-600">{successMessage}</p>}

        {selectedProduct && (
          <StockForm
            key={selectedProduct.id}
            product={selectedProduct}
            isLoading={updateMutation.isPending}
            error={updateMutation.error}
            onCancel={() => {
              setSelectedProduct(null);
              updateMutation.reset();
            }}
            onSubmit={(values) => updateMutation.mutate({ productId: selectedProduct.id, values })}
          />
        )}

        {isError ? (
          <div role="alert" className="card p-6 text-sm text-error-600">
            <p>Unable to load inventory: {error.message}</p>
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn-secondary mt-3">
              Try again
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data || []}
            keyExtractor={(product) => product.id}
            isLoading={isLoading}
            emptyMessage={page === 1 ? 'No inventory found.' : 'No more inventory found. Go back to the previous page.'}
          />
        )}

        <nav aria-label="Inventory pagination" className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn-secondary"
            disabled={page === 1 || isFetching || updateMutation.isPending}
            onClick={() => { setSelectedProduct(null); setPage(page - 1); }}
          >
            Previous
          </button>
          <span className="text-sm text-secondary-500">Page {page}</span>
          <button
            type="button"
            className="btn-secondary"
            disabled={isFetching || isError || (data?.length || 0) < PAGE_SIZE || updateMutation.isPending}
            onClick={() => { setSelectedProduct(null); setPage(page + 1); }}
          >
            Next
          </button>
        </nav>
      </div>
    </AdminLayout>
  );
}
