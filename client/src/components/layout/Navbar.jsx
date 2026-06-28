import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { ROUTES } from '../../constants/routes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Sun,
  Moon,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Package,
  Shield,
  ShoppingBag,
  Search
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate('/');
    }
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span>KOL <span className="text-primary">Store</span></span>
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex relative flex-1 max-w-xs lg:max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 h-9 w-full bg-secondary/50 border-border/60 focus:bg-background focus:ring-1 focus:ring-primary/20 duration-150"
          />
        </form>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to={ROUTES.HOME} className={navLinkClass} end>
            Shop
          </NavLink>
          {user && (
            <>
              <NavLink to={ROUTES.WISHLIST} className={navLinkClass}>
                Wishlist
              </NavLink>
              <NavLink to={ROUTES.ORDERS} className={navLinkClass}>
                Orders
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to={ROUTES.ADMIN} className={navLinkClass}>
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* Right actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>

          {/* Wishlist */}
          {user && (
            <Link to={ROUTES.WISHLIST}>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-red-500">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Cart */}
          <Link to={ROUTES.CART}>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 h-auto hover:bg-secondary rounded-lg"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {(user.name || 'User').split(' ')[0]}
                </span>
              </Button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg ring-1 ring-black/5 focus:outline-none z-40 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="text-xs font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    <Link
                      to={ROUTES.ORDERS}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-secondary text-foreground hover:text-primary transition"
                    >
                      <Package className="h-3.5 w-3.5" />
                      <span>My Orders</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to={ROUTES.ADMIN}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-md hover:bg-secondary text-foreground hover:text-primary transition"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 rounded-md hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="default" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }}
            aria-label="Toggle search"
            className="text-muted-foreground hover:text-foreground"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Mobile Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden animate-in slide-in-from-top-5 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative flex w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="pl-9 h-9 w-full bg-secondary/50 border-border/60 focus:bg-background"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-5 duration-200">
          <nav className="flex flex-col gap-3">
            <NavLink to={ROUTES.HOME} className={navLinkClass} onClick={() => setMenuOpen(false)} end>
              Shop
            </NavLink>
            <NavLink to={ROUTES.CART} className={navLinkClass} onClick={() => setMenuOpen(false)}>
              Cart ({cartCount})
            </NavLink>
            {user && (
              <>
                <NavLink to={ROUTES.WISHLIST} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Wishlist ({wishlistCount})
                </NavLink>
                <NavLink to={ROUTES.ORDERS} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Orders
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to={ROUTES.ADMIN} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                Admin Panel
              </NavLink>
            )}
            
            <div className="h-px bg-border/50 my-2" />

            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button onClick={handleLogout} variant="destructive" className="w-full text-center mt-2">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link to={ROUTES.LOGIN} className="w-full" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER} className="w-full" onClick={() => setMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
