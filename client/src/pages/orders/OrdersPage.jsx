import { Link } from 'react-router-dom';
import { useMyOrders } from '../../hooks/useOrders';
import { formatPrice, formatDate } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderItemsList from '../../components/orders/OrderItemsList';
import { ROUTES } from '../../constants/routes';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const OrdersPage = () => {
  const { orders, loading, error } = useMyOrders();

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-container">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground mb-8">Track payments, delivery status, and history of purchases.</p>

      {error && <Alert message={error} className="mb-6" />}

      {!error && orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders placed yet"
          description="Your purchase history will appear here once you place an order."
          action={
            <Link to={ROUTES.HOME}>
              <Button>Start Shopping</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="bg-card hover:shadow-md transition-shadow border border-border">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-4 mb-4">
                  <div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="font-bold text-foreground hover:text-primary transition text-base"
                    >
                      Order #{order._id.slice(-8).toUpperCase()}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground font-semibold">{formatDate(order.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div>
                  <OrderItemsList items={order.orderItems.slice(0, 2)} compact />
                  {order.orderItems.length > 2 && (
                    <p className="mt-2 text-xs font-semibold text-muted-foreground">
                      +{order.orderItems.length - 2} more item(s) in package
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-4 text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Status: <span className="text-foreground">{order.isPaid ? '✓ Paid' : 'Unpaid'}</span> · Method: <span className="text-foreground">{order.paymentMethod}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-extrabold text-foreground">{formatPrice(order.totalPrice)}</span>
                    <Link to={`/orders/${order._id}`}>
                      <Button variant="outline" size="sm" className="gap-1 h-8 text-xs font-semibold">
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
