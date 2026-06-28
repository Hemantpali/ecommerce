import { ShoppingBag } from 'lucide-react';
import { Card } from '../ui/card';

const EmptyState = ({ title, description, action, icon: Icon = ShoppingBag }) => (
  <Card className="flex flex-col items-center justify-center border-dashed border-2 border-border/80 px-6 py-16 text-center bg-card/40 transition-colors duration-200">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-muted-foreground shadow-sm">
      <Icon className="h-7 w-7 opacity-80" />
    </div>
    <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="mt-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">{action}</div>}
  </Card>
);

export default EmptyState;
