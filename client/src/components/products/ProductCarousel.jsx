import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../ui/toast';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../constants/routes';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

const getVisibleProducts = (products, startIndex, count = 4) => {
  if (products.length <= count) return products;

  return Array.from({ length: count }, (_, offset) => products[(startIndex + offset) % products.length]);
};

const ProductCarousel = ({ products = [], loading = false, error = '' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, updating } = useCart();
  const { toast } = useToast();
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
      toast({
        title: 'Added to cart',
        description: `"${product.name}" has been added to your cart.`,
        variant: 'success',
      });
    } catch (err) {
      if (err.message === 'LOGIN_REQUIRED') {
        navigate(ROUTES.LOGIN, { state: { from: { pathname: ROUTES.HOME } } });
      } else {
        const errMsg = err.response?.data?.message || 'Failed to add item to cart';
        setCartError(errMsg);
        toast({
          title: 'Failed to add to cart',
          description: errMsg,
          variant: 'destructive',
        });
      }
    }
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
        </div>
        <Loader />
      </section>
    );
  }

  if (error || featuredProducts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Top Picks</span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-1">Featured Products</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="rounded-full h-9 w-9"
            aria-label="Previous featured products"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="rounded-full h-9 w-9"
            aria-label="Next featured products"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
            <Card key={`${product._id}-${index}`} className="group flex flex-col h-full bg-card border-none shadow-none hover:shadow-lg transition-all duration-300">
              <Link to={`/products/${product._id}`} className="block relative aspect-[4/3] overflow-hidden bg-transparent flex items-center justify-center p-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Product';
                  }}
                  loading="lazy"
                />
                <Badge variant="destructive" className="absolute left-3 top-3 px-2 py-0.5 font-bold shadow-sm">
                  {discount}% OFF
                </Badge>
              </Link>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <Link
                    to={`/products/${product._id}`}
                    className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={updating}
                  className="mt-4 w-full flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{updating ? 'Adding...' : 'Add to Cart'}</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {featuredProducts.map((product, index) => (
          <button
            key={product._id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show featured product ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
