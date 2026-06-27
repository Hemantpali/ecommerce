import { Link } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { useWishlist } from '../../context/WishlistContext';
import { ROUTES } from '../../constants/routes';

const WishlistPage = () => {
  const { items, loading } = useWishlist();

  if (loading) return <Loader fullScreen />;

  return (
    <div className="page-container">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
          <p className="mt-1 text-sm text-slate-500">Save favourites and come back to them later.</p>
        </div>
        <Link to={ROUTES.HOME} className="btn-secondary">
          Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No favourites yet"
          description="Tap the heart on any product to save it to your wishlist."
          action={
            <Link to={ROUTES.HOME} className="btn-primary">
              Browse Products
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
