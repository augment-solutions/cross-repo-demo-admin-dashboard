# Dependencies

This file documents dependencies that this repository (the **consumer**) has
on components, services, or packages owned by other repositories (the
**provider**). Entries describe outbound consumer -> provider relationships
and can be reverse-looked-up across repos when planning changes to a
provider: before changing a provider's API/contract, search other repos'
`DEPENDENCIES.md` files for entries naming that provider.

## Provider index

- [API Gateway](https://github.com/augment-solutions/cross-repo-demo-core) (`cross-repo-demo-core`, `services/api-gateway`)
- [Inventory Service](https://github.com/augment-solutions/cross-repo-demo-inventory-service) (`cross-repo-demo-inventory-service`) — reached transparently through the API Gateway proxy below

## cross-repo-demo-admin-dashboard dependencies

### API Gateway — Inventory routes (`/api/v1/inventory/*`)

- **Kind:** Runtime — internal HTTP API (proxied service call)
- **Provider:** API Gateway, [`augment-solutions/cross-repo-demo-core`](https://github.com/augment-solutions/cross-repo-demo-core) (`services/api-gateway`). The gateway proxies these routes to the [Inventory Service](https://github.com/augment-solutions/cross-repo-demo-inventory-service) (`cross-repo-demo-inventory-service`) without changing the response shape for the list endpoint (path is rewritten to `/api/v1/products`) and passes the update route straight through. Provider repository for the Inventory Service's own route definitions was not inspected beyond confirming the repository exists; treat its contract as defined by the gateway's proxy config.
- **Consumer files/symbols:**
  - [`services/admin-dashboard/services/api/inventory.ts`](https://github.com/augment-solutions/cross-repo-demo-admin-dashboard/blob/2eff1439c412d1180bc744d7f6fbbce39d7a5fd8/services/admin-dashboard/services/api/inventory.ts) — `inventoryApi.getProducts`, `inventoryApi.updateInventory`
  - [`services/admin-dashboard/types/inventory.ts`](https://github.com/augment-solutions/cross-repo-demo-admin-dashboard/blob/2eff1439c412d1180bc744d7f6fbbce39d7a5fd8/services/admin-dashboard/types/inventory.ts) — `InventoryProduct`, `Inventory`, `InventoryQueryParams`, `UpdateInventoryRequest`
  - [`services/admin-dashboard/lib/inventory.ts`](https://github.com/augment-solutions/cross-repo-demo-admin-dashboard/blob/2eff1439c412d1180bc744d7f6fbbce39d7a5fd8/services/admin-dashboard/lib/inventory.ts) — `LOW_STOCK_THRESHOLD`, `MAX_INVENTORY_QUANTITY` assume the service's default alert threshold and an `i32` quantity range
  - [`services/admin-dashboard/app/admin/inventory/page.tsx`](https://github.com/augment-solutions/cross-repo-demo-admin-dashboard/blob/2eff1439c412d1180bc744d7f6fbbce39d7a5fd8/services/admin-dashboard/app/admin/inventory/page.tsx) and [`services/admin-dashboard/components/inventory/StockForm.tsx`](https://github.com/augment-solutions/cross-repo-demo-admin-dashboard/blob/2eff1439c412d1180bc744d7f6fbbce39d7a5fd8/services/admin-dashboard/components/inventory/StockForm.tsx) — consume the above client/types to render and edit stock
- **Consumed contract:**
  - `GET /api/v1/inventory/products?limit=&offset=` -> `InventoryProduct[]` with fields `id, sku, name, description, price, available_quantity, reserved_quantity`
  - `PUT /api/v1/inventory/{productId}` with body `{ quantity: number }` -> `Inventory` with fields `id, product_id, warehouse_id, quantity, reserved_quantity, updated_at`. The dashboard sends the new **absolute** total quantity (not a delta) and validates client-side that it is an integer, within `[reserved_quantity, 2147483647]`.
- **Purpose:** Powers the new `/admin/inventory` page — paginated inventory list with low-stock indicators, and a stock-editing form that updates total quantity.
- **Category:** Runtime (frontend-to-backend API call via the shared API Gateway base URL already used for products/categories).
- **Provider changes that could break this consumer:** Changing/removing the `/api/v1/inventory/products` or `/api/v1/inventory/{productId}` gateway routes or their rewrite target; changing the response field names/types above; changing `PUT` semantics from absolute-quantity to delta-based; changing the default low-stock alert threshold (currently assumed to be `10`) or the quantity upper bound (currently assumed `i32` max, `2147483647`) without coordinating with this consumer's `lib/inventory.ts` constants.
- **Tests/migration guidance:** `services/admin-dashboard/tests/inventory.test.cjs` covers the stock form validation and status/badge logic against these assumed contract values; update it alongside any contract change.
- **Introducing source PR:** https://github.com/augment-solutions/cross-repo-demo-admin-dashboard/pull/1
- **Analyzed source head SHA:** `2eff1439c412d1180bc744d7f6fbbce39d7a5fd8`
- **Companion PR:** This dependency is only usable once the gateway routes are deployed — see companion source PR https://github.com/augment-solutions/cross-repo-demo-core/pull/1, which added the `/api/v1/inventory/products` and `/api/v1/inventory/:product_id` gateway routes.
