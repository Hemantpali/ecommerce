import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { items, updateQty, removeFromCart, subtotal, shipping, tax, total, loading, updating } =
    useCart();

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <h1 className="mb-8 text-2xl font-bold text-slate-900">Shopping Cart</h1>
        <EmptyState
          title="Sign in to view your cart"
          description="Your cart is saved to your account when you're logged in."
          action={
            <Link to={ROUTES.LOGIN} state={{ from: { pathname: ROUTES.CART } }} className="btn-primary">
              Sign In
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) return <Loader fullScreen />;

  if (items.length === 0) {
    return (
      <div className="page-container">
        <h1 className="mb-8 text-2xl font-bold text-slate-900">Shopping Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={
            <Link to={ROUTES.HOME} className="btn-primary">
              Continue Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className={`space-y-4 ${updating ? 'pointer-events-none opacity-60' : ''}`}>
          {items.map((item) => (
            <div key={item._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/96x96/e2e8f0/64748b?text=Img';
                }}
              />
              <div className="flex-1">
                <Link
                  to={`/products/${item._id}`}
                  className="font-semibold text-slate-900 hover:text-brand-600"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-slate-500">{formatPrice(item.price)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={item.qty}
                  onChange={(e) => updateQty(item._id, Number(e.target.value))}
                  className="input-field w-20"
                  disabled={updating}
                >
                  {[...Array(Math.min(item.countInStock, 10)).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </select>
                <span className="w-20 text-right font-semibold">
                  {formatPrice(item.lineTotal || item.price * item.qty)}
                </span>
                <button
                  onClick={() => removeFromCart(item._id)}
                  disabled={updating}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tax (10%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link to={ROUTES.CHECKOUT} className="btn-primary mt-6 w-full text-center">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
