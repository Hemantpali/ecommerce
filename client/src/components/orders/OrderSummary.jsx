import { formatPrice } from '../../utils/formatPrice';

const OrderSummary = ({ order }) => (
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span className="text-slate-500">Items</span>
      <span>{formatPrice(order.itemsPrice)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-500">Shipping</span>
      <span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-500">Tax</span>
      <span>{formatPrice(order.taxPrice)}</span>
    </div>
    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-base">
      <span>Total</span>
      <span>{formatPrice(order.totalPrice)}</span>
    </div>
  </div>
);

export default OrderSummary;
