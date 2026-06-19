const Footer = () => (
  <footer className="mt-auto border-t border-slate-200 bg-white">
    <div className="page-container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
      <p className="text-sm font-semibold text-brand-600">KOL Store</p>
      <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} KOL Store. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
