import { STATUS_COLORS, STATUS_LABELS } from '../../constants/orderStatuses';

const OrderStatusBadge = ({ status }) => (
  <span
    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
      STATUS_COLORS[status] || 'bg-slate-100 text-slate-800'
    }`}
  >
    {STATUS_LABELS[status] || status}
  </span>
);

export default OrderStatusBadge;
