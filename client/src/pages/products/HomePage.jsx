import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProducts, useCategories } from '../../hooks/useProducts';
import PromoBanner from '../../components/common/PromoBanner';
import ProductCarousel from '../../components/products/ProductCarousel';
import ProductFilters from '../../components/products/ProductFilters';
import ProductList from '../../components/products/ProductList';
import Alert from '../../components/common/Alert';

const HomePage = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
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

  const handleKeywordChange = (value) => {
    setKeyword(value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCategory('');
    setPage(1);
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
        onPageChange={setPage}
      />
    </div>
  );
};

export default HomePage;
