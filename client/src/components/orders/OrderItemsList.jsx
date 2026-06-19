import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

const OrderItemsList = ({ items, compact = false }) => (
  <div className="divide-y divide-slate-100">
    {items.map((item, idx) => (
      <div key={idx} className={`flex items-center gap-4 ${compact ? 'py-2' : 'py-3'}`}>
        <img
          src={item.image}
          alt={item.name}
          className={`rounded-lg object-cover ${compact ? 'h-12 w-12' : 'h-14 w-14'}`}
          onError={(e) => {
            e.target.src = 'https://placehold.co/56x56/e2e8f0/64748b?text=Img';
          }}
        />
        <div className="flex-1 min-w-0">
          {item.product?._id ? (
            <Link
              to={`/products/${item.product._id}`}
              className="font-medium text-slate-900 hover:text-brand-600 truncate block"
            >
              {item.name}
            </Link>
          ) : (
            <p className="font-medium text-slate-900 truncate">{item.name}</p>
          )}
          <p className="text-sm text-slate-500">
            {formatPrice(item.price)} × {item.qty}
          </p>
        </div>
        <span className="font-medium shrink-0">{formatPrice(item.price * item.qty)}</span>
      </div>
    ))}
  </div>
);

export default OrderItemsList;
