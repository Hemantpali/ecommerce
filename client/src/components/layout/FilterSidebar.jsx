import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCategories } from '../../hooks/useProducts';
import { Button } from '../ui/button';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ROUTES } from '../../constants/routes';

const FilterSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const activeSort = searchParams.get('sort') || 'newest';

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCategorySelect = (categoryVal) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryVal) {
      newParams.set('category', categoryVal);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    
    if (window.location.pathname !== ROUTES.HOME) {
      navigate(`/?${newParams.toString()}`);
    }
  };

  const handleSortSelect = (sortVal) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortVal && sortVal !== 'newest') {
      newParams.set('sort', sortVal);
    } else {
      newParams.delete('sort');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);

    if (window.location.pathname !== ROUTES.HOME) {
      navigate(`/?${newParams.toString()}`);
    }
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
    if (window.location.pathname !== ROUTES.HOME) {
      navigate(ROUTES.HOME);
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-xs sm:max-w-sm bg-card p-6 shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <span className="text-lg">Filters & Sort</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-8 pr-1">
          {/* Categories list */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('')}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all text-left",
                  !activeCategory
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-secondary/80"
                )}
              >
                <span>All Products</span>
                {!activeCategory && <Check className="h-4 w-4" />}
              </button>

              {categoriesLoading ? (
                <div className="space-y-2 py-2">
                  <div className="h-8 bg-muted/65 animate-pulse rounded-lg w-full" />
                  <div className="h-8 bg-muted/65 animate-pulse rounded-lg w-full" />
                  <div className="h-8 bg-muted/65 animate-pulse rounded-lg w-full" />
                </div>
              ) : (
                categories.map((cat) => {
                  const isCatActive = activeCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all text-left capitalize",
                        isCatActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-secondary/80"
                      )}
                    >
                      <span>{cat}</span>
                      {isCatActive && <Check className="h-4 w-4" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Sort selection */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</h3>
            <div className="space-y-1">
              {sortOptions.map((opt) => {
                const isSortActive = activeSort === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSortSelect(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all text-left",
                      isSortActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-secondary/80"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSortActive && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer / Clear & Apply Actions */}
        <div className="pt-4 border-t border-border space-y-3 bg-card mt-auto">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1 text-xs"
            >
              Clear All
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 text-xs"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
