'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStockSchema, MAX_INVENTORY_QUANTITY } from '@/lib/inventory';
import type { InventoryProduct, UpdateInventoryRequest } from '@/types/inventory';

interface StockFormProps {
  product: InventoryProduct;
  onSubmit: (data: UpdateInventoryRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: Error | null;
}

export function StockForm({ product, onSubmit, onCancel, isLoading, error }: StockFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateInventoryRequest>({
    resolver: zodResolver(createStockSchema(product.reserved_quantity)),
    defaultValues: {
      quantity: product.available_quantity + product.reserved_quantity,
    },
  });

  return (
    <section className="card p-6" aria-labelledby="stock-form-title">
      <h2 id="stock-form-title" className="text-lg font-semibold text-secondary-900">
        Update stock: {product.name}
      </h2>
      <p className="mt-1 text-sm text-secondary-500">
        SKU: {product.sku}. Set the total stock, including {product.reserved_quantity} reserved units.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div className="max-w-sm">
          <label htmlFor="stock-quantity" className="block text-sm font-medium text-secondary-700">
            Total quantity
          </label>
          <input
            id="stock-quantity"
            type="number"
            min={Math.max(0, product.reserved_quantity)}
            max={MAX_INVENTORY_QUANTITY}
            step="1"
            autoFocus
            disabled={isLoading}
            aria-invalid={!!errors.quantity}
            aria-describedby="stock-quantity-help stock-quantity-error"
            {...register('quantity', { valueAsNumber: true })}
            className="input-field mt-1"
          />
          <p id="stock-quantity-help" className="mt-1 text-sm text-secondary-500">
            Available stock is total quantity minus reserved units.
          </p>
          <p id="stock-quantity-error" className="mt-1 text-sm text-error-600" role="alert">
            {errors.quantity?.message}
          </p>
        </div>
        {error && <p role="alert" className="text-sm text-error-600">{error.message}</p>}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save stock'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
