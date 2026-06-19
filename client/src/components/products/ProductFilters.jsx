const ProductFilters = ({ keyword, category, sort, categories, onKeywordChange, onCategoryChange, onSortChange, onClear }) => {
  const hasFilters = keyword || category;

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search by name, brand, or description..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="input-field sm:w-48">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Active filters:</span>
          {keyword && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Search: {keyword}
            </span>
          )}
          {category && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Category: {category}
            </span>
          )}
          <button onClick={onClear} className="text-sm font-medium text-brand-600 hover:underline">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
