import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';

const CheckoutPage = () => {
  const { items, subtotal, shipping, tax, total, loading, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'PayPal',
  });

  if (loading) return <Loader fullScreen />;

  if (items.length === 0) {
    return (
      <div className="page-container text-center">
        <p className="text-slate-500">No items to checkout.</p>
        <Link to={ROUTES.HOME} className="btn-primary mt-4 inline-block">
          Go Shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await orderApi.createOrderFromCart({
        shippingAddress: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
        taxPrice: tax,
        shippingPrice: shipping,
      });

      await orderApi.payOrder(data.data._id);
      await clearCart();
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="mb-8 text-2xl font-bold text-slate-900">Checkout</h1>

      {error && (
        <div className="mb-6">
          <Alert message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-semibold">Shipping Address</h2>
          {['address', 'city', 'postalCode', 'country'].map((field) => (
            <div key={field}>
              <label className="mb-1.5 block text-sm font-medium capitalize text-slate-700">
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                required
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="input-field"
              />
            </div>
          ))}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="input-field"
            >
              <option value="PayPal">PayPal</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span className="text-slate-500">
                  {item.name} × {item.qty}
                </span>
                <span>{formatPrice(item.lineTotal || item.price * item.qty)}</span>
              </div>
            ))}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
