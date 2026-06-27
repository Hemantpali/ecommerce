import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, updating } = useCart();
  const { isWishlisted, toggleWishlist, updatingId } = useWishlist();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState('');
  const [wishlistError, setWishlistError] = useState('');
  const [added, setAdded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchProduct = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

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

  const handleWishlistToggle = async () => {
    setWishlistError('');

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      await toggleWishlist(product._id);
    } catch (err) {
      if (err.message === 'LOGIN_REQUIRED') {
        navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      } else {
        setWishlistError(err.response?.data?.message || 'Failed to update wishlist');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    setReviewSubmitting(true);

    try {
      const { data } = await productApi.createReview(id, reviewForm);
      setProduct(data.data);
      setReviewForm({ rating: 5, comment: '' });
      setReviewSuccess('Review submitted successfully');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
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
      {wishlistError && (
        <div className="mb-4">
          <Alert message={wishlistError} />
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-brand-600">{product.category}</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
            </div>
            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={updatingId === product._id}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                isWishlisted(product._id)
                  ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : 'border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-500'
              }`}
            >
              {isWishlisted(product._id) ? '♥ Favourited' : '♡ Add to Favourites'}
            </button>
          </div>
          {product.brand && <p className="mt-1 text-slate-500">Brand: {product.brand}</p>}

          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
            <span className="text-sm text-slate-500">
              <span className="text-yellow-500">{'★'.repeat(Math.round(product.rating || 0))}</span>
              <span className="text-slate-300">{'★'.repeat(5 - Math.round(product.rating || 0))}</span>
              {' '}
              {product.rating > 0 ? product.rating.toFixed(1) : 'No ratings yet'} ({product.numReviews || 0}{' '}
              reviews)
            </span>
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

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900">Customer Reviews</h2>
          {product.reviews?.length ? (
            <div className="mt-6 space-y-5">
              {product.reviews.map((review) => (
                <article key={review._id} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{review.name}</p>
                      <p className="text-sm text-yellow-500">
                        {'★'.repeat(review.rating)}
                        <span className="text-slate-300">{'★'.repeat(5 - review.rating)}</span>
                      </p>
                    </div>
                    <time className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No reviews yet. Be the first to review this product.</p>
          )}
        </div>

        <div className="card h-fit p-6">
          <h2 className="text-xl font-semibold text-slate-900">Write a Review</h2>
          {!isAuthenticated ? (
            <p className="mt-4 text-sm text-slate-500">
              <Link to={ROUTES.LOGIN} className="text-brand-600 hover:underline">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          ) : product.reviews?.some((review) => review.user === user?._id || review.user?._id === user?._id) ? (
            <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-700">
              You already reviewed this product.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              {reviewError && <Alert message={reviewError} />}
              {reviewSuccess && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{reviewSuccess}</div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  className="input-field"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Comment</label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input-field"
                  placeholder="Share your experience with this product..."
                />
              </div>
              <button type="submit" disabled={reviewSubmitting} className="btn-primary w-full">
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
