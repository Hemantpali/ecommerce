import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import FilterSidebar from './FilterSidebar';
import Footer from './Footer';
import { ToastProvider, Toaster } from '../ui/toast';
import { ROUTES } from '../../constants/routes';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide category bar on admin, auth, checkout pages
  const isAdminPath = location.pathname.startsWith('/admin');
  const isAuthPath = location.pathname === ROUTES.LOGIN || location.pathname === ROUTES.REGISTER || location.pathname === '/login' || location.pathname === '/register';
  const isCheckoutPath = location.pathname === '/checkout';

  const showCategoryBar = !isAdminPath && !isAuthPath && !isCheckoutPath;

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        {showCategoryBar && (
          <CategoryBar onToggleSidebar={() => setIsSidebarOpen(true)} />
        )}
        <main className="flex-1 py-8">
          <Outlet />
        </main>
        {showCategoryBar && (
          <FilterSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}
        <Footer />
        <Toaster />
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
