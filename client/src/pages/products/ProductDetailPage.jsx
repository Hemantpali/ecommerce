import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/toast';
import { formatPrice } from '../../utils/formatPrice';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select } from '../../components/ui/select';
import { ArrowLeft, Heart, ShoppingCart, Star, MessageSquare } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, updating } = useCart();
  const { isWishlisted, toggleWishlist, updatingId } = useWishlist();
  const { toast } = useToast();
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
      toast({
        title: 'Added to cart',
        description: `Added ${qty} × "${product.name}" to your cart.`,
        variant: 'success',
      });
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      if (err.message === 'LOGIN_REQUIRED') {
        navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      } else {
        const msg = err.response?.data?.message || 'Failed to add to cart';
        setCartError(msg);
        toast({
          title: 'Add to cart failed',
          description: msg,
          variant: 'destructive',
        });
      }
    }
  };

  const handleWishlistToggle = async () => {
    setWishlistError('');

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    const wished = isWishlisted(product._id);

    try {
      await toggleWishlist(product._id);
      toast({
        title: wished ? 'Removed from wishlist' : 'Added to wishlist',
        description: wished
          ? `"${product.name}" has been removed from your wishlist.`
          : `"${product.name}" has been added to your wishlist.`,
        variant: wished ? 'default' : 'success',
      });
    } catch (err) {
      if (err.message === 'LOGIN_REQUIRED') {
        navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${id}` } } });
      } else {
        const msg = err.response?.data?.message || 'Failed to update wishlist';
        setWishlistError(msg);
        toast({
          title: 'Wishlist update failed',
          description: msg,
          variant: 'destructive',
        });
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
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
        variant: 'success',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      setReviewError(msg);
      toast({
        title: 'Review failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.round(rating || 0);
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4 shrink-0',
              i < fullStars ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="page-container"><Alert message={error} /></div>;
  if (!product) return null;

  const wished = isWishlisted(product._id);

  return (
    <div className="page-container select-none">
      <Link to={ROUTES.HOME} className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to shop</span>
      </Link>

      {cartError && (
        <div className="mb-4">
          <Alert message={cartError} onClose={() => setCartError('')} />
        </div>
      )}
      {wishlistError && (
        <div className="mb-4">
          <Alert message={wishlistError} onClose={() => setWishlistError('')} />
        </div>
      )}

      {/* Main product card layout */}
      <div className="grid gap-8 lg:grid-cols-2 mb-10">
        <Card className="overflow-hidden border border-border bg-card shadow-sm">
          <CardContent className="p-0">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-102"
              onError={(e) => {
                e.target.src = 'https://placehold.co/600x600/e2e8f0/64748b?text=Product';
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col justify-between py-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </span>
            
            <div className="flex flex-wrap items-start justify-between gap-4 mt-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight sm:text-4xl flex-1">
                {product.name}
              </h1>
              
              <Button
                variant={wished ? 'secondary' : 'outline'}
                onClick={handleWishlistToggle}
                disabled={updatingId === product._id}
                className={cn(
                  'rounded-lg gap-2 h-10',
                  wished && 'text-red-500 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20'
                )}
              >
                <Heart className={cn('h-4 w-4', wished && 'fill-current')} />
                <span>{wished ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </Button>
            </div>

            {product.brand && (
              <p className="mt-2 text-sm text-muted-foreground font-medium">
                Brand: <span className="text-foreground">{product.brand}</span>
              </p>
            )}

            {/* Ratings Summary */}
            <div className="mt-4 flex items-center gap-3">
              {renderStars(product.rating)}
              <span className="text-sm font-semibold text-muted-foreground">
                {product.rating > 0 ? product.rating.toFixed(1) : 'No ratings'} ({product.numReviews || 0} reviews)
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="text-3xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
              <Badge variant={product.countInStock > 0 ? 'success' : 'destructive'} className="px-3 py-1 font-semibold">
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <p className="mt-6 text-base text-muted-foreground leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          <div className="mt-8 border-t border-border/50 pt-6">
            {product.countInStock > 0 ? (
              <div className="flex flex-wrap items-center gap-4">
                <Select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-24"
                  disabled={updating}
                >
                  {[...Array(Math.min(product.countInStock, 10)).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </Select>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={updating}
                  className="px-8 gap-2"
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  <span>{updating ? 'Adding...' : 'Add to Cart'}</span>
                </Button>
                
                {added && (
                  <Link to={ROUTES.CART} className="text-sm font-semibold text-emerald-600 hover:underline">
                    View Cart →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-destructive">
                This item is currently sold out and unavailable.
              </p>
            )}

            {!isAuthenticated && (
              <p className="mt-4 text-xs text-muted-foreground">
                Please{' '}
                <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
                  sign in
                </Link>{' '}
                to add items to your cart and write reviews.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="grid gap-8 lg:grid-cols-[1fr_380px] mt-12 border-t border-border/50 pt-10">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-border/10 pb-4 mb-4">
            <MessageSquare className="h-5 w-5 text-primary opacity-80" />
            <CardTitle className="text-lg">Customer Reviews</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {product.reviews?.length ? (
              <div className="divide-y divide-border/50">
                {product.reviews.map((review, idx) => (
                  <div key={review._id} className={cn('py-5', idx === 0 && 'pt-0', idx === product.reviews.length - 1 && 'pb-0')}>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{review.name}</p>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                      <time className="text-xs text-muted-foreground font-medium">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed font-medium bg-secondary/35 p-3 rounded-lg border border-border/20">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No reviews yet. Be the first to share your thoughts on this product!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card className="h-fit bg-card">
          <CardHeader className="border-b border-border/10 pb-4 mb-4">
            <CardTitle className="text-lg">Write a Review</CardTitle>
          </CardHeader>
          
          <CardContent>
            {!isAuthenticated ? (
              <p className="text-xs text-muted-foreground font-medium">
                Please{' '}
                <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
                  sign in
                </Link>{' '}
                to submit a product rating and review.
              </p>
            ) : product.reviews?.some((review) => review.user === user?._id || review.user?._id === user?._id) ? (
              <p className="rounded-lg bg-secondary p-4 text-xs font-semibold text-muted-foreground text-center">
                You have already submitted a review for this product.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && <Alert message={reviewError} onClose={() => setReviewError('')} />}
                {reviewSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {reviewSuccess}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Rating</label>
                  <Select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  >
                    <option value={5}>5 ★★★★★ (Excellent)</option>
                    <option value={4}>4 ★★★★☆ (Very good)</option>
                    <option value={3}>3 ★★★☆☆ (Good)</option>
                    <option value={2}>2 ★★☆☆☆ (Fair)</option>
                    <option value={1}>1 ★☆☆☆☆ (Poor)</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">Comment</label>
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary duration-150"
                    placeholder="Tell us what you like or dislike about this item..."
                  />
                </div>
                
                <Button type="submit" disabled={reviewSubmitting} className="w-full font-bold">
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ProductDetailPage;
