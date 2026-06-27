import { Link, NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const AdminLayout = () => {
  const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <div className="page-container">
      <div className="mb-6">
        <Link to={ROUTES.HOME} className="text-sm text-brand-600 hover:underline">
          ← Back to store
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="card h-fit p-3">
          <nav className="flex flex-col gap-1">
            <NavLink to={ROUTES.ADMIN} end className={linkClass}>
              Overview
            </NavLink>
            <NavLink to={`${ROUTES.ADMIN}/products`} className={linkClass}>
              Products
            </NavLink>
            <NavLink to={`${ROUTES.ADMIN}/orders`} className={linkClass}>
              Orders
            </NavLink>
            <NavLink to={`${ROUTES.ADMIN}/coupons`} className={linkClass}>
              Coupons
            </NavLink>
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
