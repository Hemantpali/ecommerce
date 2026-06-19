import { Link } from 'react-router-dom';
import { useMyOrders } from '../../hooks/useOrders';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderItemsList from '../../components/orders/OrderItemsList';
import { ROUTES } from '../../constants/routes';

const OrdersPage = () => {
  const { orders, loading, error } = useMyOrders();

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-container">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">My Orders</h1>
      <p className="mb-8 text-sm text-slate-500">Track and view your order history</p>

      {error && <Alert message={error} />}

      {!error && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will appear here."
          action={
            <Link to={ROUTES.HOME} className="btn-primary">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Link
                    to={`/orders/${order._id}`}
                    className="font-semibold text-slate-900 hover:text-brand-600"
                  >
                    Order #{order._id.slice(-8).toUpperCase()}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-4">
                <OrderItemsList items={order.orderItems.slice(0, 2)} compact />
                {order.orderItems.length > 2 && (
                  <p className="mt-2 text-sm text-slate-500">
                    +{order.orderItems.length - 2} more item(s)
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <span className="text-sm text-slate-500">
                  {order.isPaid ? '✓ Paid' : 'Unpaid'} · {order.paymentMethod}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">{formatPrice(order.totalPrice)}</span>
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
