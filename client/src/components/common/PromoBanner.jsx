import { useEffect, useState } from 'react';

const promos = [
  {
    title: 'Flash Sale Live',
    message: 'Save up to 50% on bestselling picks for a limited time.',
    cta: 'Shop Deals',
    gradient: 'from-red-500 via-rose-500 to-orange-500',
  },
  {
    title: 'Use Coupon FRESH20',
    message: 'Take 20% off your next order with code FRESH20 at checkout.',
    cta: 'Apply Coupon',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
  },
  {
    title: 'New Launches',
    message: 'Explore the latest arrivals handpicked for your everyday needs.',
    cta: 'Discover New',
    gradient: 'from-purple-600 via-fuchsia-500 to-indigo-600',
  },
  {
    title: 'Weekend Specials',
    message: 'Grab hot offers with fast delivery before the weekend ends.',
    cta: 'View Offers',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
  },
];

const PromoBanner = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % promos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activePromo = promos[activeIndex];

  return (
    <section className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${activePromo.gradient} px-6 py-12 text-white shadow-lg sm:px-10`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_35%)]" />
      <div className="relative z-10 max-w-2xl">
        <p className="mb-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
          Limited Time Promo
        </p>
        <h1 className="text-3xl font-bold sm:text-5xl">{activePromo.title}</h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">{activePromo.message}</p>
        <button className="mt-6 rounded-lg bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow transition hover:-translate-y-0.5 hover:bg-slate-100">
          {activePromo.cta}
        </button>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
        {promos.map((promo, index) => (
          <button
            key={promo.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Show ${promo.title}`}
            className={`h-2.5 rounded-full transition-all ${
              activeIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default PromoBanner;
