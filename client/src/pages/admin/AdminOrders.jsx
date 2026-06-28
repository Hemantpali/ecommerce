import { useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAllOrders } from '../../hooks/useOrders';
import { useToast } from '../../components/ui/toast';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import { ORDER_STATUSES, STATUS_LABELS } from '../../constants/orderStatuses';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderItemsList from '../../components/orders/OrderItemsList';
import OrderSummary from '../../components/orders/OrderSummary';
import { Card, CardContent } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ChevronDown, ChevronUp, RefreshCw, ShoppingCart } from 'lucide-react';

const AdminOrders = () => {
  const { toast } = useToast();
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
      const successMsg = `Order status updated to ${STATUS_LABELS[status]} successfully.`;
      setSuccess(successMsg);
      toast({
        title: 'Status updated',
        description: successMsg,
        variant: 'success',
      });
      refetch();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update status';
      setError(errMsg);
      toast({
        title: 'Update failed',
        description: errMsg,
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const displayError = error || fetchError;

  return (
    <div className="select-none">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage Orders</h2>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">{allOrders.length} orders total</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={refetch} className="h-10 w-10">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-44"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Metric Status Buttons */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ORDER_STATUSES.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(isActive ? '' : status)}
              className={`card p-4 text-left border transition-all duration-200 select-none ${
                isActive ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30 hover:shadow-sm'
              }`}
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{STATUS_LABELS[status]}</p>
              <p className="text-xl font-extrabold text-foreground mt-1">{statusCounts[status] || 0}</p>
            </button>
          );
        })}
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
        <Card className="py-16 text-center border border-dashed border-border/80 bg-card/45">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mx-auto mb-4">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-foreground">No orders found</p>
          <p className="text-xs text-muted-foreground mt-1 leading-normal">There are no orders listed matching this criteria.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id;
            return (
              <Card key={order._id} className="overflow-hidden border border-border bg-card shadow-sm">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-extrabold text-base text-foreground">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground font-semibold">
                          Customer: <span className="text-foreground">{order.user?.name || 'Unknown'}</span> ({order.user?.email || 'No email'})
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-base font-extrabold text-foreground">{formatPrice(order.totalPrice)}</p>
                        <p className="text-xs text-muted-foreground font-semibold mt-0.5">{order.orderItems.length} items</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Update status:</span>
                        <Select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="w-36 h-9"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </Select>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Payment:</span>
                        <Badge variant={order.isPaid ? 'success' : 'warning'} className="px-2 py-0.2">
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : order._id)}
                        className="ml-auto text-xs gap-1 hover:bg-secondary h-8"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/80 bg-secondary/35 p-6 animate-in fade-in duration-200">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div>
                          <h4 className="mb-3 text-xs font-bold text-foreground uppercase tracking-wider">Ordered Items</h4>
                          <OrderItemsList items={order.orderItems} compact />
                        </div>
                        <div className="space-y-6">
                          <div>
                            <h4 className="mb-3 text-xs font-bold text-foreground uppercase tracking-wider">Order Summary</h4>
                            <OrderSummary order={order} />
                          </div>
                          <div className="text-xs font-semibold text-muted-foreground">
                            <p className="font-bold text-foreground uppercase tracking-wider mb-2">Ship To:</p>
                            <p className="text-foreground">{order.shippingAddress?.address}</p>
                            <p className="mt-0.5">
                              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                            </p>
                            <p className="mt-0.5">{order.shippingAddress?.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
