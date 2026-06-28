import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none duration-150',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:opacity-90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-muted/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:opacity-90',
        outline: 'text-foreground border-border bg-background',
        success: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10',
        warning: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 dark:bg-amber-500/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
