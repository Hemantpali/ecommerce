import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../constants/routes';

const getVisibleProducts = (products, startIndex, count = 4) => {
  if (products.length <= count) return products;

  return Array.from({ length: count }, (_, offset) => products[(startIndex + offset) % products.length]);
};

const ProductCarousel = ({ products = [], loading = false, error = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, updating } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cartError, setCartError] = useState('');

  const featuredProducts = useMemo(() => products.filter((product) => product.countInStock > 0), [products]);
  const visibleProducts = getVisibleProducts(featuredProducts, activeIndex);

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? Math.max(featuredProducts.length - 1, 0) : current - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % featuredProducts.length);
  };

  const handleAddToCart = async (product) => {
    setCartError('');

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.HOME } } });
      return;
    }

    try {
      await addToCart(product, 1);
    } catch (err) {
      if (err.message === 'LOGIN_REQUIRED') {
        navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.HOME } } });
      } else {
        setCartError(err.response?.data?.message || 'Failed to add item to cart');
      }
    }
  };

  if (loading) {
    return (
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
        </div>
        <Loader />
      </section>
    );
  }

  if (error || featuredProducts.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Top picks</p>
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToPrevious}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Previous featured products"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            aria-label="Next featured products"
          >
            ›
          </button>
        </div>
      </div>

      {cartError && (
        <div className="mb-4">
          <Alert message={cartError} onClose={() => setCartError('')} />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product, index) => {
          const discount = product.discount || [15, 20, 25, 30][index % 4];
          const rating = Number(product.rating || 0);

          return (
            <article key={`${product._id}-${index}`} className="card overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
              <Link to={`/products/${product._id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Product';
                    }}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
                    {discount}% OFF
                  </span>
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/products/${product._id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-brand-600">
                  {product.name}
                </Link>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                  <span className="text-sm text-slate-500">
                    <span className="text-yellow-500">★</span> {rating > 0 ? rating.toFixed(1) : 'New'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  disabled={updating}
                  className="btn-primary mt-4 w-full"
                >
                  {updating ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {featuredProducts.map((product, index) => (
          <button
            key={product._id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show featured product ${index + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              activeIndex === index ? 'w-8 bg-brand-600' : 'w-2.5 bg-slate-300 hover:bg-brand-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
