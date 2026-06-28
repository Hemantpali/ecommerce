import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useProducts';
import { cn } from '../../utils/cn';
import { Menu } from 'lucide-react';

const CategoryBar = ({ onToggleSidebar }) => {
  const { categories, loading } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const view = searchParams.get('view') || '';
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
      newParams.delete('view');
    } else {
      newParams.delete('category');
      newParams.set('view', 'all');
    }
    // Reset to page 1 when category changes
    newParams.set('page', '1');
    setSearchParams(newParams);
    
    // If we're not on the home page, redirect to home page with search params
    if (window.location.pathname !== '/') {
      navigate(`/?${newParams.toString()}`);
    }
  };

  if (loading) {
    return (
      <div className="border-b border-border bg-secondary/35 h-10 w-full animate-pulse flex items-center">
        <div className="page-container flex gap-6">
          <div className="h-4 bg-muted/60 rounded w-16" />
          <div className="h-4 bg-muted/60 rounded w-20" />
          <div className="h-4 bg-muted/60 rounded w-24" />
          <div className="h-4 bg-muted/60 rounded w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-secondary/35 backdrop-blur-sm select-none">
      <div className="page-container flex h-10 items-center justify-start gap-5 overflow-x-auto py-1 scrollbar-none scroll-smooth">
        {/* All Filters button */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition shrink-0 border-r border-border/80 pr-4 py-1.5"
        >
          <Menu className="h-4 w-4" />
          <span>All Filters</span>
        </button>

        {/* All Products button */}
        <button
          onClick={() => handleCategoryClick('')}
          className={cn(
            "text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:text-primary shrink-0 relative py-1.5",
            (view === 'all' && !activeCategory)
              ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full"
              : "text-muted-foreground"
          )}
        >
          All Products
        </button>

        {/* Dynamic Category buttons */}
        {categories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:text-primary shrink-0 relative py-1.5",
                isActive
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:rounded-full"
                  : "text-muted-foreground"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
