import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { formatDate } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderItemsList from '../../components/orders/OrderItemsList';
import OrderSummary from '../../components/orders/OrderSummary';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, CreditCard, MapPin, Package, ClipboardList } from 'lucide-react';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { order, loading, error } = useOrder(id);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><Alert message={error} /></div>;
  if (!order) return null;

  const { shippingAddress } = order;

  return (
    <div className="page-container select-none">
      <Link to={ROUTES.ORDERS} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to orders</span>
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_345px]">
        {/* Main Details */}
        <div className="space-y-6">
          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="border-b border-border/10 pb-4 mb-4 flex flex-row items-center gap-2">
              <Package className="h-5 w-5 text-primary opacity-80" />
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsList items={order.orderItems} />
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="border-b border-border/10 pb-4 mb-4 flex flex-row items-center gap-2">
              <MapPin className="h-5 w-5 text-primary opacity-80" />
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground font-medium">
                <span className="text-foreground font-semibold">{order.user?.name || 'Customer'}</span><br />
                {shippingAddress.address}<br />
                {shippingAddress.city}, {shippingAddress.postalCode}<br />
                {shippingAddress.country}
              </address>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary & Payment Details */}
        <div className="space-y-6">
          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="border-b border-border/10 pb-4 mb-4 flex flex-row items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary opacity-80" />
              <CardTitle className="text-base">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant={order.isPaid ? 'success' : 'warning'} className="px-2 py-0.2">
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid on</span>
                  <span className="text-foreground">{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.paymentResult?.razorpayPaymentId && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="break-all text-right text-foreground font-mono">{order.paymentResult.razorpayPaymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="border-b border-border/10 pb-4 mb-4 flex flex-row items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary opacity-80" />
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderSummary order={order} />
            </CardContent>
          </Card>

          {order.isDelivered && order.deliveredAt && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center">
              ✓ Item delivered on {formatDate(order.deliveredAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
