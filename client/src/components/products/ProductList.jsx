import ProductCard from '../common/ProductCard';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

const ProductList = ({ products, loading, meta, page, onPageChange, emptyTitle = 'No products found' }) => {
  if (loading) return <Loader fullScreen />;

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description="Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-500">
        Showing {products.length} of {meta.total} products
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      <Pagination page={page} pages={meta.pages} onPageChange={onPageChange} />
    </>
  );
};

export default ProductList;
