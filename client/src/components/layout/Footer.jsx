import { ShoppingBag } from 'lucide-react';

const Footer = () => (
  <footer className="mt-auto border-t border-border bg-background transition-all duration-300">
    <div className="page-container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
          <ShoppingBag className="h-3.5 w-3.5" />
        </div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          KOL <span className="text-primary">Store</span>
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} KOL Store. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
