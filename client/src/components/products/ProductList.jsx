import ProductCard from '../common/ProductCard';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import { Card } from '../ui/card';

const ProductList = ({ products, loading, meta, page, onPageChange, emptyTitle = 'No products found' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx} className="flex flex-col h-full border border-border bg-card animate-pulse">
            <div className="aspect-square w-full bg-muted" />
            <div className="p-4 flex-1 space-y-3">
              <div className="h-3 w-1/4 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="flex items-center justify-between mt-4">
                <div className="h-5 w-1/3 rounded bg-muted" />
                <div className="h-4 w-1/4 rounded bg-muted" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

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
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
