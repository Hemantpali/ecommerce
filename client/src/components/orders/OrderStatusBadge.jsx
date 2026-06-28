import { Badge } from '../ui/badge';
import { STATUS_LABELS } from '../../constants/orderStatuses';

const OrderStatusBadge = ({ status }) => {
  const variants = {
    pending: 'warning',
    processing: 'secondary',
    shipped: 'outline',
    delivered: 'success',
    cancelled: 'destructive',
  };

  return (
    <Badge variant={variants[status] || 'default'} className="capitalize font-semibold select-none">
      {STATUS_LABELS[status] || status}
    </Badge>
  );
};

export default OrderStatusBadge;
