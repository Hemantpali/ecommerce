import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const ProductFilters = ({
  keyword,
  category,
  sort,
  categories,
  onKeywordChange,
  onCategoryChange,
  onSortChange,
  onClear,
}) => {
  const hasFilters = keyword || category;

  return (
    <div id="products-section" className="mb-8 space-y-4 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search products, brands, and categories..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Select */}
        <Select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        {/* Sort Select */}
        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="sm:w-48"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </Select>
      </div>

      {/* Active Filter Badges */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in-50 duration-200">
          <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
          {keyword && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1">
              <span>Search: "{keyword}"</span>
              <button
                type="button"
                onClick={() => onKeywordChange('')}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="flex items-center gap-1 pl-2.5 pr-1.5 py-1">
              <span>Category: {category}</span>
              <button
                type="button"
                onClick={() => onCategoryChange('')}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="link"
            size="sm"
            onClick={onClear}
            className="h-auto p-0 text-xs font-semibold text-primary/85 hover:text-primary transition"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
