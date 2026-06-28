import ProductCard from '../common/ProductCard';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ArrowRight } from 'lucide-react';

const ProductSection = ({ title, tagline, Icon, products, loading, error, onViewAll }) => {
  if (error) return null;

  return (
    <section className="my-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-2 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          </div>
          {tagline && <p className="text-sm text-muted-foreground mt-1">{tagline}</p>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="group hover:bg-primary/5 text-primary hover:text-primary transition-all duration-200 self-start md:self-auto pl-2 pr-3 py-1.5 h-auto text-xs font-semibold gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="flex flex-col h-full border-none bg-card animate-pulse">
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
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductSection;
