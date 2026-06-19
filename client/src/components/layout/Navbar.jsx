import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ROUTES } from '../../constants/routes';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between">
        <Link to={ROUTES.HOME} className="text-xl font-bold text-brand-600">
          KOL Store
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to={ROUTES.HOME} className={navLinkClass} end>
            Shop
          </NavLink>
          {user && (
            <NavLink to={ROUTES.ORDERS} className={navLinkClass}>
              Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to={ROUTES.ADMIN} className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to={ROUTES.CART}
            className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Hi, {(user.name || 'User').split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to={ROUTES.LOGIN} className="btn-secondary text-sm">
                Login
              </Link>
              <Link to={ROUTES.REGISTER} className="btn-primary text-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <NavLink to={ROUTES.HOME} className={navLinkClass} onClick={() => setMenuOpen(false)} end>
              Shop
            </NavLink>
            <NavLink to={ROUTES.CART} className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Cart ({cartCount})
            </NavLink>
            {user && (
              <NavLink to={ROUTES.ORDERS} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to={ROUTES.ADMIN} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Admin
              </NavLink>
            )}
            {user ? (
              <button onClick={handleLogout} className="btn-secondary w-full">
                Logout
              </button>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="btn-secondary w-full text-center" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to={ROUTES.REGISTER} className="btn-primary w-full text-center" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
