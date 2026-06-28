import { Link } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { useWishlist } from '../../context/WishlistContext';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/ui/button';
import { Heart } from 'lucide-react';

const WishlistPage = () => {
  const { items, loading } = useWishlist();

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-container select-none">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review your saved items and add them to cart.</p>
        </div>
        <Link to={ROUTES.HOME}>
          <Button variant="outline" size="sm">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites saved yet"
          description="Browse products and click the heart icon on cards to save your favorites."
          action={
            <Link to={ROUTES.HOME}>
              <Button>Explore Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
