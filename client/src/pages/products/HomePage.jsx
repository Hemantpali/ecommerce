import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useProducts, useCategories } from '../../hooks/useProducts';
import PromoBanner from '../../components/common/PromoBanner';
import ProductCarousel from '../../components/products/ProductCarousel';
import ProductFilters from '../../components/products/ProductFilters';
import ProductList from '../../components/products/ProductList';
import Alert from '../../components/common/Alert';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const debouncedKeyword = useDebounce(keyword);

  const { categories } = useCategories();
  const { products, meta, loading, error } = useProducts({
    keyword: debouncedKeyword,
    category,
    sort,
    page,
    limit: 12,
  });
  const {
    products: featuredProducts,
    loading: featuredLoading,
    error: featuredError,
  } = useProducts({ sort: 'rating', limit: 8 });

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

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage.toString() });
  };

  return (
    <div className="page-container">
      <PromoBanner />

      <ProductCarousel
        products={featuredProducts}
        loading={featuredLoading}
        error={featuredError}
      />

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
  );
};

export default HomePage;
