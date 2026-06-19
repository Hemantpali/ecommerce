import { useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAllOrders } from '../../hooks/useOrders';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import { ORDER_STATUSES, STATUS_LABELS } from '../../constants/orderStatuses';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderItemsList from '../../components/orders/OrderItemsList';
import OrderSummary from '../../components/orders/OrderSummary';

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { orders: allOrders, loading, error: fetchError, refetch } = useAllOrders();

  const orders = statusFilter
    ? allOrders.filter((o) => o.status === statusFilter)
    : allOrders;

  const statusCounts = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = allOrders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setSuccess('');
    setError('');
    try {
      await orderApi.updateOrderStatus(id, status);
      setSuccess('Order status updated successfully');
      refetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const displayError = error || fetchError;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage Orders</h2>
          <p className="mt-1 text-sm text-slate-500">{allOrders.length} total orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-44"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
            className={`card p-3 text-left transition ${
              statusFilter === status ? 'ring-2 ring-brand-500' : 'hover:shadow-md'
            }`}
          >
            <p className="text-xs text-slate-500">{STATUS_LABELS[status]}</p>
            <p className="text-lg font-bold text-slate-900">{statusCounts[status] || 0}</p>
          </button>
        ))}
      </div>

      {displayError && (
        <div className="mb-4">
          <Alert message={displayError} onClose={() => setError('')} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <div className="card py-12 text-center text-slate-500">No orders found.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-slate-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {order.user?.name} · {order.user?.email}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(order.totalPrice)}</p>
                    <p className="text-sm text-slate-500">{order.orderItems.length} items</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">Update status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={updatingId === order._id}
                    className="input-field w-44"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <span className={`text-sm ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                    className="ml-auto text-sm font-medium text-brand-600 hover:underline"
                  >
                    {expandedId === order._id ? 'Hide details' : 'View details'}
                  </button>
                </div>
              </div>

              {expandedId === order._id && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-slate-900">Items</h4>
                      <OrderItemsList items={order.orderItems} compact />
                    </div>
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-slate-900">Summary</h4>
                      <OrderSummary order={order} />
                      <div className="mt-4 text-sm text-slate-600">
                        <p className="font-medium text-slate-900">Ship to:</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
