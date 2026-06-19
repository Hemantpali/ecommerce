import { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, pending: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productApi.getProducts({ limit: 1 }),
          productApi.getCategories(),
        ]);

        setStats((prev) => ({
          ...prev,
          products: productsRes.data.meta?.total || 0,
          categories: categoriesRes.data.data?.length || 0,
        }));
      } catch {
        /* keep defaults */
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Total Products', value: stats.products },
    { label: 'Categories', value: stats.categories },
    { label: 'Catalog Status', value: stats.products > 0 ? 'Active' : 'Empty' },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">Product Overview</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card p-6">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-600">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <h3 className="font-semibold text-slate-900">Quick Actions</h3>
        <p className="mt-2 text-sm text-slate-500">
          Use the Products tab to add, edit, or delete items. Changes sync instantly with the storefront.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-green-50 px-3 py-1.5 text-green-700">GET /api/products</span>
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700">POST /api/products</span>
          <span className="rounded-lg bg-yellow-50 px-3 py-1.5 text-yellow-700">PUT /api/products/:id</span>
          <span className="rounded-lg bg-red-50 px-3 py-1.5 text-red-700">DELETE /api/products/:id</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
