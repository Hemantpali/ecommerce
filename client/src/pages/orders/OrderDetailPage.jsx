import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { formatDate } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderItemsList from '../../components/orders/OrderItemsList';
import OrderSummary from '../../components/orders/OrderSummary';
import { ROUTES } from '../../constants/routes';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><Alert message={error} /></div>;
  if (!order) return null;

  const { shippingAddress } = order;

  return (
    <div className="page-container">
      <Link to={ROUTES.ORDERS} className="mb-6 inline-block text-sm text-brand-600 hover:underline">
        ← Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Order Items</h2>
            <OrderItemsList items={order.orderItems} />
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Shipping Address</h2>
            <address className="not-italic text-sm leading-relaxed text-slate-600">
              {shippingAddress.address}<br />
              {shippingAddress.city}, {shippingAddress.postalCode}<br />
              {shippingAddress.country}
            </address>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Payment</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={order.isPaid ? 'text-green-600' : 'text-yellow-600'}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid on</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-slate-900">Order Summary</h2>
            <OrderSummary order={order} />
          </div>

          {order.isDelivered && order.deliveredAt && (
            <div className="card border-green-200 bg-green-50 p-4 text-sm text-green-700">
              ✓ Delivered on {formatDate(order.deliveredAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
