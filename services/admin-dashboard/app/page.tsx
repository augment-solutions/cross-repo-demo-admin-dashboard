import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Package, FolderTree, Warehouse, BarChart3, Settings } from 'lucide-react';

export default function AdminHomePage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Welcome to the admin dashboard. Manage your products, categories, and inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/products"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">Products</h3>
                <p className="text-sm text-secondary-500">Manage your product catalog</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderTree className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">Categories</h3>
                <p className="text-sm text-secondary-500">Organize product categories</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/inventory"
            className="card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Warehouse className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">Inventory</h3>
                <p className="text-sm text-secondary-500">Manage stock levels</p>
              </div>
            </div>
          </Link>

          <div className="card p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-secondary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">Analytics</h3>
                <p className="text-sm text-secondary-500">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="card p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-8 w-8 text-secondary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-secondary-900">Settings</h3>
                <p className="text-sm text-secondary-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

