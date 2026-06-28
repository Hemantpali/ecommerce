import { Link, NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ArrowLeft, LayoutDashboard, ShoppingCart, Tag, ShoppingBag } from 'lucide-react';

const AdminLayout = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition duration-200 select-none ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`;

  return (
    <div className="page-container">
      <div className="mb-8">
        <Link to={ROUTES.HOME} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to store</span>
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Admin Control Panel</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit p-3 bg-card border border-border shadow-sm">
          <nav className="flex flex-col gap-1">
            <NavLink to={ROUTES.ADMIN} end className={linkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </NavLink>
            <NavLink to={`${ROUTES.ADMIN}/products`} className={linkClass}>
              <ShoppingBag className="h-4 w-4" />
              <span>Products</span>
            </NavLink>
            <NavLink to={`${ROUTES.ADMIN}/orders`} className={linkClass}>
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </NavLink>
            <NavLink to={`${ROUTES.ADMIN}/coupons`} className={linkClass}>
              <Tag className="h-4 w-4" />
              <span>Coupons</span>
            </NavLink>
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
