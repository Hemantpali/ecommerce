import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

const ProductCard = ({ product }) => (
  <Link to={`/products/${product._id}`} className="card group overflow-hidden transition hover:shadow-md">
    <div className="aspect-square overflow-hidden bg-slate-100">
      <img
        src={product.image}
        alt={product.name}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        onError={(e) => {
          e.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=Product';
        }}
      />
    </div>
    <div className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{product.category}</p>
      <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900 group-hover:text-brand-600">
        {product.name}
      </h3>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
        {product.countInStock > 0 ? (
          <span className="text-xs text-green-600">In stock</span>
        ) : (
          <span className="text-xs text-red-500">Out of stock</span>
        )}
      </div>
    </div>
  </Link>
);

export default ProductCard;
