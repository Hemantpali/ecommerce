import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/orderApi';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';

const CheckoutPage = () => {
  const { items, subtotal, shipping, tax, total, loading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'Razorpay',
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

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const startRazorpayPayment = async (orderId) => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
      throw new Error('Unable to load Razorpay checkout. Please check your connection and try again.');
    }

    const { data } = await orderApi.createRazorpayOrder(orderId);
    const { key, razorpayOrder } = data.data;

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Ecommerce Store',
        description: `Order #${orderId.slice(-8).toUpperCase()}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response) => {
          try {
            await orderApi.verifyRazorpayPayment(orderId, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled')),
        },
      });

      razorpay.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Razorpay payment failed'));
      });

      razorpay.open();
    });
  };

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

      if (form.paymentMethod === 'Razorpay') {
        await startRazorpayPayment(data.data._id);
      }

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
              <option value="Razorpay">Razorpay</option>
              <option value="PayPal">PayPal</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
            {form.paymentMethod !== 'Razorpay' && (
              <p className="mt-2 text-xs text-slate-500">
                This method will place an unpaid order for admin follow-up.
              </p>
            )}
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
