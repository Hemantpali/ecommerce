import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, updating } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await productApi.getProduct(id);
        setProduct(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setCartError('');

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      await addToCart(product, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      if (err.message === 'LOGIN_REQUIRED') {
        navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      } else {
        setCartError(err.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><Alert message={error} /></div>;
  if (!product) return null;

  return (
    <div className="page-container">
      <Link to={ROUTES.HOME} className="mb-6 inline-block text-sm text-brand-600 hover:underline">
        ← Back to shop
      </Link>

      {cartError && (
        <div className="mb-4">
          <Alert message={cartError} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/600x600/e2e8f0/64748b?text=Product';
            }}
          />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
          {product.brand && <p className="mt-1 text-slate-500">Brand: {product.brand}</p>}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
            {product.rating > 0 && (
              <span className="text-sm text-slate-500">
                ★ {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>

          <div className="mt-6">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                product.countInStock > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
            </span>
          </div>

          {product.countInStock > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <select
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="input-field w-24"
                disabled={updating}
              >
                {[...Array(Math.min(product.countInStock, 10)).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>
                    {n + 1}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddToCart}
                disabled={updating}
                className="btn-primary px-8"
              >
                {updating ? 'Adding...' : 'Add to Cart'}
              </button>
              {added && (
                <Link to={ROUTES.CART} className="text-sm font-medium text-green-600">
                  View cart →
                </Link>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-slate-500">
              <Link to={ROUTES.LOGIN} className="text-brand-600 hover:underline">
                Sign in
              </Link>{' '}
              to save items to your cart.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
