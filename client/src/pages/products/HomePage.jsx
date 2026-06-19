import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useProducts, useCategories } from '../../hooks/useProducts';
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
      <section className="mb-10 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-12 text-white sm:px-10">
        <h1 className="text-3xl font-bold sm:text-4xl">Discover Quality Products</h1>
        <p className="mt-3 max-w-xl text-brand-100">
          Shop the latest collection with fast delivery and secure checkout.
        </p>
      </section>

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
