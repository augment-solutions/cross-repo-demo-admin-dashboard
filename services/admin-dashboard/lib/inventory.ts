import { z } from 'zod';

// Matches the Inventory Service's default alert threshold.
export const LOW_STOCK_THRESHOLD = 10;
export const MAX_INVENTORY_QUANTITY = 2147483647; // Rust i32

export function getStockStatus(availableQuantity: number) {
  if (availableQuantity <= 0) return 'Out of stock';
  if (availableQuantity < LOW_STOCK_THRESHOLD) return 'Low stock';
  return 'In stock';
}

export function createStockSchema(reservedQuantity: number) {
  return z.object({
    quantity: z.number({ invalid_type_error: 'Enter a whole number.' })
      .int('Quantity must be a whole number.')
      .min(Math.max(0, reservedQuantity), `Quantity must be at least ${Math.max(0, reservedQuantity)} (reserved stock).`)
      .max(MAX_INVENTORY_QUANTITY, `Quantity cannot exceed ${MAX_INVENTORY_QUANTITY}.`),
  });
}
