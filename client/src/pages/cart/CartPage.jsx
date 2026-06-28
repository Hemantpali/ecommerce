import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/toast';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, Lock, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { items, updateQty, removeFromCart, subtotal, shipping, tax, total, loading, updating } =
    useCart();

  const handleUpdateQty = async (itemId, newQty, itemName) => {
    try {
      await updateQty(itemId, newQty);
      toast({
        title: 'Cart updated',
        description: `Quantity for "${itemName}" updated to ${newQty}.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Update failed',
        description: 'Could not update item quantity.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveItem = async (itemId, itemName) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: 'Item removed',
        description: `"${itemName}" has been removed from your cart.`,
        variant: 'default',
      });
    } catch {
      toast({
        title: 'Removal failed',
        description: 'Could not remove item from cart.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container select-none">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-foreground">Shopping Cart</h1>
        <EmptyState
          icon={Lock}
          title="Sign in to view your cart"
          description="Access your saved cart items, coupons, and orders."
          action={
            <Link to={ROUTES.LOGIN} state={{ from: { pathname: ROUTES.CART } }}>
              <Button>Sign In to Account</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) return <Loader fullScreen />;

  if (items.length === 0) {
    return (
      <div className="page-container select-none">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-foreground">Shopping Cart</h1>
        <EmptyState
          icon={ShoppingBag}
          title="Your shopping cart is empty"
          description="Looks like you haven't added any products yet."
          action={
            <Link to={ROUTES.HOME}>
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container select-none">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-foreground">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_365px]">
        {/* Cart items list */}
        <div className={`space-y-4 ${updating ? 'pointer-events-none opacity-60' : ''} transition-opacity`}>
          {items.map((item) => (
            <Card key={item._id} className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center bg-card shadow-sm border border-border">
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 rounded-lg object-cover bg-secondary"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/96x96/e2e8f0/64748b?text=Img';
                }}
              />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item._id}`}
                  className="font-semibold text-foreground hover:text-primary transition truncate block"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground font-medium">{formatPrice(item.price)} each</p>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <Select
                  value={item.qty}
                  onChange={(e) => handleUpdateQty(item._id, Number(e.target.value), item.name)}
                  className="w-18 h-9"
                  disabled={updating}
                >
                  {[...Array(Math.min(item.countInStock, 10)).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </Select>
                <span className="w-20 text-right font-bold text-sm text-foreground">
                  {formatPrice(item.lineTotal || item.price * item.qty)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(item._id, item.name)}
                  disabled={updating}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary card */}
        <Card className="h-fit bg-card shadow-sm border border-border">
          <CardHeader className="border-b border-border/10 pb-4">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-foreground">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-muted-foreground">Estimated Tax (10%)</span>
                <span className="text-foreground">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-4 text-base font-extrabold text-foreground">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link to={ROUTES.CHECKOUT} className="block mt-6">
              <Button className="w-full font-bold flex items-center justify-center gap-1.5 h-11">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CartPage;
