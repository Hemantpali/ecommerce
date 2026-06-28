import { useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useProducts, useCategories } from '../../hooks/useProducts';
import PromoBanner from '../../components/common/PromoBanner';
import ProductCarousel from '../../components/products/ProductCarousel';
import ProductFilters from '../../components/products/ProductFilters';
import ProductList from '../../components/products/ProductList';
import ProductSection from '../../components/products/ProductSection';
import Alert from '../../components/common/Alert';
import { Sparkles, Flame, Tag } from 'lucide-react';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const debouncedKeyword = useDebounce(keyword);

  const { categories } = useCategories();
  
  // Grid/Search Results Products
  const { products, meta, loading, error } = useProducts({
    keyword: debouncedKeyword,
    category,
    sort,
    page,
    limit: 12,
  });

  // Featured Products (Carousel)
  const {
    products: featuredProducts,
    loading: featuredLoading,
    error: featuredError,
  } = useProducts({ sort: 'rating', limit: 8 });

  // Best Sellers (Section 1)
  const {
    products: bestSellers,
    loading: bestSellersLoading,
    error: bestSellersError,
  } = useProducts({ sort: 'rating', limit: 4 });

  // New Arrivals (Section 2)
  const {
    products: newArrivals,
    loading: newArrivalsLoading,
    error: newArrivalsError,
  } = useProducts({ sort: 'newest', limit: 4 });

  // Best Deals (Section 3)
  const {
    products: bestDeals,
    loading: bestDealsLoading,
    error: bestDealsError,
  } = useProducts({ sort: 'price_asc', limit: 4 });

  const isResultsMode = !!(keyword || category || searchParams.get('view') === 'all');

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  };

  const handleKeywordChange = (value) => {
    updateParams({ search: value, page: '1' });
  };

  const handleCategoryChange = (value) => {
    updateParams({ category: value, page: '1' });
  };

  const handleSortChange = (value) => {
    updateParams({ sort: value, page: '1' });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const resultsRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isResultsMode) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [keyword, category, sort, isResultsMode]);

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage.toString() });
  };

  const handleViewAll = (sectionSort) => {
    updateParams({ view: 'all', sort: sectionSort, page: '1' });
  };

  return (
    <div className="page-container">
      {/* Sub-sections Mode (Default landing page) */}
      {!isResultsMode && (
        <>
          <PromoBanner products={featuredProducts} />

          <ProductCarousel
            products={featuredProducts}
            loading={featuredLoading}
            error={featuredError}
          />

          <ProductSection
            title="Best Sellers"
            tagline="Our most popular products loved by customers."
            Icon={Sparkles}
            products={bestSellers}
            loading={bestSellersLoading}
            error={bestSellersError}
            onViewAll={() => handleViewAll('rating')}
          />

          <ProductSection
            title="New Arrivals"
            tagline="Be the first to get your hands on our latest releases."
            Icon={Flame}
            products={newArrivals}
            loading={newArrivalsLoading}
            error={newArrivalsError}
            onViewAll={() => handleViewAll('newest')}
          />

          <ProductSection
            title="Best Deals"
            tagline="Unbeatable prices on high-quality favorites."
            Icon={Tag}
            products={bestDeals}
            loading={bestDealsLoading}
            error={bestDealsError}
            onViewAll={() => handleViewAll('price_asc')}
          />
        </>
      )}

      {/* Results Mode (Search / Category / All Products view) */}
      {isResultsMode && (
        <div ref={resultsRef} className="pt-2 animate-in fade-in duration-300">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-border/40 pb-4 gap-2">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground capitalize">
                {keyword ? `Search Results for "${keyword}"` : category ? `${category}` : 'All Products'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Showing products matching your criteria
              </p>
            </div>
          </div>

          <ProductFilters
            keyword={keyword}
            category={category}
            sort={sort}
            categories={categories}
            onKeywordChange={handleKeywordChange}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onClear={handleClearFilters}
          />

          {error && (
            <div className="mb-6">
              <Alert message={error} />
            </div>
          )}

          <ProductList
            products={products}
            loading={loading}
            meta={meta}
            page={page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
