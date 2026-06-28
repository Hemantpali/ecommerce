import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';
import { ROUTES } from '../../constants/routes';
import { ORDER_STATUSES } from '../../constants/orderStatuses';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

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

  if (loading) return <Loader fullScreen />;

  const metricCards = [
    { label: 'Total Revenue', value: formatPrice(stats.revenue), helper: `${stats.paidOrders} paid orders`, icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Total Orders', value: stats.orders, helper: `${stats.pending} awaiting review`, icon: ShoppingCart, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Avg Order Value', value: formatPrice(stats.averageOrderValue), helper: 'Based on paid orders', icon: TrendingUp, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Total Catalog Products', value: stats.products, helper: `${stats.categories} categories`, icon: ShoppingBag, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Low Stock Items', value: stats.lowStock, helper: `≤ ${LOW_STOCK_THRESHOLD} units left`, icon: AlertTriangle, color: 'text-orange-500 bg-orange-500/10' },
    { label: 'Out of Stock Items', value: stats.outOfStock, helper: 'Needs restock soon', icon: AlertCircle, color: 'text-red-500 bg-red-500/10' },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Store health</span>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Dashboard Overview</h2>
        </div>
        <Link to={`${ROUTES.ADMIN}/orders`}>
          <Button variant="outline" size="sm" className="gap-1">
            <span>View all orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="bg-card border border-border shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-foreground">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground font-semibold">{card.helper}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline and Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Order pipeline */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="border-b border-border/10 pb-4 mb-4">
            <CardTitle className="text-base">Order Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {ORDER_STATUSES.map((status) => (
                <div key={status} className="flex items-center justify-between gap-4 font-semibold text-xs">
                  <OrderStatusBadge status={status} />
                  <span className="text-foreground">{stats.statusCounts[status] || 0}</span>
                </div>
              ))}
            </div>
            
            <div className="rounded-lg bg-secondary/45 p-4 text-xs font-semibold leading-relaxed text-muted-foreground border border-border/20">
              There are <span className="text-primary font-bold">{stats.unpaidOrders}</span> unpaid orders currently pending. Payment confirmation may be required.
            </div>
          </CardContent>
        </Card>

        {/* Latest orders */}
        <Card className="bg-card border border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/10 pb-4 mb-2">
            <CardTitle className="text-base">Latest Orders</CardTitle>
            <CardDescription className="text-xs">Most recent customer purchase activity.</CardDescription>
          </CardHeader>
          
          <div className="divide-y divide-border/20">
            {stats.latestOrders.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground text-center">No orders recorded yet.</div>
            ) : (
              stats.latestOrders.map((order) => (
                <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-secondary/20 transition-colors">
                  <div>
                    <Link to={`/orders/${order._id}`} className="font-bold text-sm text-foreground hover:text-primary transition">
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      {order.user?.name || 'Customer'} · {order.orderItems.length} items
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="font-bold text-sm text-foreground">{formatPrice(order.totalPrice)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
