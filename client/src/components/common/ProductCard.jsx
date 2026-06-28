import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../ui/toast';
import { ROUTES } from '../../constants/routes';
import { Heart } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist, updatingId } = useWishlist();
  const { toast } = useToast();
  const wished = isWishlisted(product._id);
  const updating = updatingId === product._id;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: { pathname: `/products/${product._id}` } } });
      return;
    }

    try {
      await toggleWishlist(product._id);
      toast({
        title: wished ? 'Removed from wishlist' : 'Added to wishlist',
        description: wished
          ? `"${product.name}" has been removed from your wishlist.`
          : `"${product.name}" has been added to your wishlist.`,
        variant: wished ? 'default' : 'success',
      });
    } catch {
      toast({
        title: 'Error updating wishlist',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="group relative flex flex-col h-full bg-card hover:shadow-lg transition-all duration-300">
      <Link to={`/products/${product._id}`} className="block flex-1">
        {/* Product Image */}
        <div className="aspect-square w-full overflow-hidden bg-secondary relative">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=Product';
            }}
            loading="lazy"
          />
          {product.countInStock <= 0 && (
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="px-3 py-1 font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-between flex-1">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </span>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-base font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.countInStock > 0 && (
              <Badge variant="success" className="px-2 py-0">
                In Stock
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistClick}
        disabled={updating}
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-sm shadow-sm backdrop-blur transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
          wished ? 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' : 'text-muted-foreground hover:text-red-500'
        }`}
      >
        <Heart className={`h-4.5 w-4.5 ${wished ? 'fill-current' : ''}`} />
      </button>
    </Card>
  );
};

export default ProductCard;
