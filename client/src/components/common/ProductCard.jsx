import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { ROUTES } from '../../constants/routes';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist, updatingId } = useWishlist();
  const wished = isWishlisted(product._id);
  const updating = updatingId === product._id;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${product._id}` } } });
      return;
    }

    await toggleWishlist(product._id);
  };

  return (
    <div className="card group relative overflow-hidden transition hover:shadow-md">
      <Link to={`/products/${product._id}`} className="block">
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
      <button
        type="button"
        onClick={handleWishlistClick}
        disabled={updating}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow transition hover:scale-105 disabled:opacity-60 ${
          wished ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
        }`}
      >
        {wished ? '♥' : '♡'}
      </button>
    </div>
  );
};

export default ProductCard;
