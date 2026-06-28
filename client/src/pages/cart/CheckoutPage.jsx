import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/toast';
import { orderApi } from '../../api/orderApi';
import { couponApi } from '../../api/couponApi';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ShieldCheck, ShoppingCart, ArrowLeft } from 'lucide-react';

const CheckoutPage = () => {
  const { items, subtotal, shipping, tax, total, loading, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
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
      <div className="page-container text-center py-16 select-none">
        <p className="text-muted-foreground text-sm font-semibold mb-4">No items to checkout.</p>
        <Link to={ROUTES.HOME}>
          <Button>Go Shopping</Button>
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
      let paymentCompleted = false;

      const verifyPayment = async (response) => {
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
      };

      const razorpay = new window.Razorpay({
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'KOL Store',
        description: `Order #${orderId.slice(-8).toUpperCase()}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#4f46e5', // Primary Indigo
        },
        handler: function (response) {
          paymentCompleted = true;
          verifyPayment(response);
        },
        modal: {
          ondismiss: () => {
            if (!paymentCompleted) {
              reject(new Error('Payment window closed.'));
            }
          },
        },
      });

      razorpay.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Razorpay payment failed'));
      });

      razorpay.open();
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponError('');
    setValidatingCoupon(true);

    try {
      const { data } = await couponApi.validateCoupon({
        code: couponCode.trim(),
        orderAmount: subtotal,
      });
      setAppliedCoupon(data.data);
      setCouponCode('');
      toast({
        title: 'Coupon applied!',
        description: `Successfully applied discount code: "${data.data.coupon.code}".`,
        variant: 'success',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      toast({
        title: 'Coupon failed',
        description: msg,
        variant: 'destructive',
      });
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    toast({
      title: 'Coupon removed',
      description: 'Discount coupon has been removed from summary.',
      variant: 'default',
    });
  };

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const totalAfterDiscount = total - discountAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const orderPayload = {
        shippingAddress: {
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        paymentMethod: form.paymentMethod,
        taxPrice: tax,
        shippingPrice: shipping,
      };

      if (appliedCoupon) {
        orderPayload.couponCode = appliedCoupon.coupon.code;
      }

      const { data } = await orderApi.createOrderFromCart(orderPayload);

      if (form.paymentMethod === 'Razorpay') {
        toast({
          title: 'Opening payment gateway',
          description: 'Please complete your Razorpay payment.',
          variant: 'default',
        });
        await startRazorpayPayment(data.data._id);
      }

      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for shopping with us.',
        variant: 'success',
      });
      await clearCart();
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed';
      setError(msg);
      toast({
        title: 'Order placement failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container select-none">
      <Link to={ROUTES.CART} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to cart</span>
      </Link>

      <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-foreground">Checkout</h1>

      {error && (
        <div className="mb-6">
          <Alert message={error} onClose={() => setError('')} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_365px]">
        {/* Shipping address form card */}
        <Card className="bg-card shadow-sm border border-border p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Shipping Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Please fill in your correct address for shipping.</p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground">Address</label>
              <Input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Apartment, Street name, House number"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground">City</label>
              <Input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City name"
              />
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground">Postal Code</label>
              <Input
                required
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="6 digits PIN"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground">Country</label>
              <Input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="Country name"
              />
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground">Payment Method</label>
            <Select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="Razorpay">Razorpay Gateway (Online)</option>
              <option value="Cash on Delivery">Cash on Delivery (COD)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="PayPal">PayPal</option>
            </Select>
            {form.paymentMethod !== 'Razorpay' && (
              <p className="mt-2 text-xs text-muted-foreground bg-secondary/50 p-2.5 rounded-lg border border-border/10 leading-normal">
                Note: Selecting COD or direct payment will create an unpaid order pending administrator verification.
              </p>
            )}
          </div>
        </Card>

        {/* Right column: Order Summary & Coupon code */}
        <div className="space-y-6">
          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Items in Order</span>
                <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Product list */}
              <div className="max-h-[160px] overflow-y-auto divide-y divide-border/20 pr-1">
                {items.map((item) => (
                  <div key={item._id} className="flex justify-between py-2.5 first:pt-0 last:pb-0 text-sm">
                    <span className="text-muted-foreground font-medium truncate max-w-[200px]">
                      {item.name} <span className="text-foreground font-semibold">× {item.qty}</span>
                    </span>
                    <span className="font-bold text-foreground shrink-0">
                      {formatPrice(item.lineTotal || item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon inputs */}
              <div className="border-t border-border pt-4">
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    disabled={!!appliedCoupon}
                    className="h-9 text-xs"
                  />
                  {appliedCoupon ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveCoupon}
                      className="shrink-0 h-9 px-3 text-xs border-destructive hover:bg-destructive/10 text-destructive"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="shrink-0 h-9 px-3 text-xs"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </Button>
                  )}
                </div>
                
                {couponError && (
                  <p className="mt-1.5 text-xs text-destructive font-semibold">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>
                      Coupon applied: save{' '}
                      {appliedCoupon.coupon.type === 'percentage'
                        ? `${appliedCoupon.coupon.value}%`
                        : formatPrice(appliedCoupon.coupon.value)}
                    </span>
                  </p>
                )}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2 border-t border-border pt-4 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{formatPrice(tax)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount Code</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/50 pt-3 text-sm font-extrabold text-foreground">
                  <span>Grand Total</span>
                  <span>{formatPrice(totalAfterDiscount)}</span>
                </div>
              </div>
              
              <Button type="submit" disabled={submitting} className="w-full font-bold h-11 mt-2">
                {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
