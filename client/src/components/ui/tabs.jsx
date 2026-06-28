import * as React from 'react';
import { cn } from '../../utils/cn';

const TabsContext = React.createContext({
  value: '',
  onValueChange: () => null,
});

const Tabs = ({ value, onValueChange, className, children, ...props }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-secondary p-1 text-muted-foreground border border-border/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, className, children, ...props }) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
  const active = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active && 'bg-background text-foreground shadow-sm font-semibold',
        !active && 'hover:text-foreground hover:bg-background/20',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children, ...props }) => {
  const { value: selectedValue } = React.useContext(TabsContext);
  if (selectedValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        'mt-4 focus-visible:outline-none duration-150 animate-in fade-in-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
