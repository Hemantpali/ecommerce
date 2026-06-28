import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastProvider, Toaster } from '../ui/toast';

const MainLayout = () => (
  <ToastProvider>
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  </ToastProvider>
);

export default MainLayout;
