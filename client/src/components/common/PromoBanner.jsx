import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Tag } from 'lucide-react';

const promos = [
  {
    title: 'Flash Sale Live',
    message: 'Save up to 50% on bestselling picks for a limited time.',
    cta: 'Shop Deals',
    gradient: 'from-rose-500 via-pink-500 to-indigo-600 dark:from-rose-600 dark:via-pink-600 dark:to-indigo-800',
    image: 'https://placehold.co/600x600/1a1a2e/ffffff?text=Phone',
    imageAlt: 'Smartphone deal',
  },
  {
    title: 'Use Coupon FRESH20',
    message: 'Take 20% off your next order with code FRESH20 at checkout.',
    cta: 'Apply Coupon',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-800',
    image: 'https://placehold.co/600x600/2c3e50/ffffff?text=Earbuds',
    imageAlt: 'Wireless earbuds deal',
  },
  {
    title: 'New Arrivals',
    message: 'Explore the latest collection handpicked for your everyday lifestyle.',
    cta: 'Discover New',
    gradient: 'from-indigo-600 via-purple-500 to-pink-500 dark:from-indigo-800 dark:via-purple-700 dark:to-pink-700',
    image: 'https://placehold.co/600x600/c5c5c5/1a1a2e?text=Laptop',
    imageAlt: 'New laptop arrival',
  },
  {
    title: 'Weekend Special Offers',
    message: 'Grab hot deals with fast delivery before the weekend ends.',
    cta: 'View Offers',
    gradient: 'from-amber-500 via-orange-500 to-red-500 dark:from-amber-600 dark:via-orange-600 dark:to-red-600',
    image: 'https://placehold.co/600x600/ff6b6b/ffffff?text=Gaming',
    imageAlt: 'Gaming deals',
  },
];

const PromoBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activePromo = promos[activeIndex];

  return (
    <section className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br ${activePromo.gradient} px-6 py-14 text-white shadow-md sm:px-12 transition-all duration-700`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.2))] pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-2/5 hidden md:block pointer-events-none">
        <div className="absolute inset-y-0 left-0 w-1/4 z-10 bg-gradient-to-r from-[rgba(0,0,0,0.35)] to-transparent" />
        <img
          src={activePromo.image}
          alt={activePromo.imageAlt}
          className="h-full w-full object-cover object-right opacity-90"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      
      <div className="relative z-10 max-w-2xl">
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
          <Tag className="h-3 w-3" />
          <span>Limited Time Promotion</span>
        </p>
        <h1 className="text-3xl font-extrabold sm:text-5xl tracking-tight leading-none text-white drop-shadow-sm select-none">
          {activePromo.title}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg drop-shadow-sm font-medium select-none">
          {activePromo.message}
        </p>
        
        <Button
          variant="secondary"
          className="mt-6 font-bold bg-white text-slate-900 hover:bg-slate-100 hover:text-black shadow-md border-transparent hover:-translate-y-0.5"
          onClick={() => {
            // Can trigger search/scroll to products
            const target = document.getElementById('products-section');
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span>{activePromo.cta}</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
        {promos.map((promo, index) => (
          <button
            key={promo.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show promo ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoBanner;
