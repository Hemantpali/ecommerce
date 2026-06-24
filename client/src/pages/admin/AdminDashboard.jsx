import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';
import { ROUTES } from '../../constants/routes';
import { STATUS_COLORS } from '../../constants/orderStatuses';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';

const LOW_STOCK_THRESHOLD = 5;

const EMPTY_STATS = {
  products: 0,
  categories: 0,
  orders: 0,
  revenue: 0,
  pending: 0,
  paidOrders: 0,
  unpaidOrders: 0,
  lowStock: 0,
  outOfStock: 0,
  averageOrderValue: 0,
  latestOrders: [],
  statusCounts: {},
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, categoriesRes, ordersRes] = await Promise.all([
          productApi.getProducts({ limit: 100 }),
          productApi.getCategories(),
          orderApi.getAllOrders(),
        ]);

        const products = productsRes.data.data || [];
        const orders = ordersRes.data.data || [];
        const paidOrders = orders.filter((order) => order.isPaid);
        const revenue = paidOrders.reduce((total, order) => total + (Number(order.totalPrice) || 0), 0);
        const statusCounts = orders.reduce((counts, order) => {
          counts[order.status] = (counts[order.status] || 0) + 1;
          return counts;
        }, {});

        setStats({
          products: productsRes.data.meta?.total || products.length,
          categories: categoriesRes.data.data?.length || 0,
          orders: orders.length,
          revenue,
          pending: statusCounts.pending || 0,
          paidOrders: paidOrders.length,
          unpaidOrders: orders.length - paidOrders.length,
          lowStock: products.filter(
            (product) => product.countInStock > 0 && product.countInStock <= LOW_STOCK_THRESHOLD
          ).length,
          outOfStock: products.filter((product) => product.countInStock <= 0).length,
          averageOrderValue: paidOrders.length ? revenue / paidOrders.length : 0,
          latestOrders: orders.slice(0, 5),
          statusCounts,
        });
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
    { label: 'Total Revenue', value: formatPrice(stats.revenue), helper: `${stats.paidOrders} paid orders` },
    { label: 'Total Orders', value: stats.orders, helper: `${stats.pending} awaiting review` },
    { label: 'Average Order Value', value: formatPrice(stats.averageOrderValue), helper: 'Based on paid orders' },
    { label: 'Total Products', value: stats.products, helper: `${stats.categories} categories` },
    { label: 'Low Stock Items', value: stats.lowStock, helper: `≤ ${LOW_STOCK_THRESHOLD} units left` },
    { label: 'Out of Stock', value: stats.outOfStock, helper: 'Restock soon' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600">Store health</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">Dashboard Overview</h2>
        </div>
        <Link to={`${ROUTES.ADMIN}/orders`} className="btn-secondary text-sm">
          View all orders
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="card p-6">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-600">{card.value}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Order Pipeline</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(STATUS_COLORS).map(([status, className]) => (
              <div key={status} className="flex items-center justify-between gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${className}`}>
                  {status}
                </span>
                <span className="font-semibold text-slate-900">{stats.statusCounts[status] || 0}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{stats.unpaidOrders}</span> unpaid orders may need payment
            follow-up.
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900">Latest Orders</h3>
            <p className="mt-1 text-sm text-slate-500">Most recent customer activity across the store.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.latestOrders.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No orders yet.</div>
            ) : (
              stats.latestOrders.map((order) => (
                <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-slate-900">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-slate-500">
                      {order.user?.name || 'Customer'} · {order.orderItems.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatPrice(order.totalPrice)}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
