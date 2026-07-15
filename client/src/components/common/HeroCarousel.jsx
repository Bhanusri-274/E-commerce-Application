import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const DEFAULT_SLIDES = [
  {
    title: "Big Deals, Bigger Savings",
    subtitle: "Up to 50% OFF on Top Brands",
    desc: "Shop your favorites at unbeatable prices.",
    badge: "50% OFF",
    btn: "Shop Now",
    link: "/products",
    gradient: "from-[#0F172A] via-[#1E3A5F] to-[#0F172A]",
  },
];

const HeroCarousel = ({ banners = [] }) => {
  const [index, setIndex] = useState(0);

  const slides = banners.length > 0 ? banners : DEFAULT_SLIDES;

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  if (banners.length === 0) {
    // Default promotional slide (no image)
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${DEFAULT_SLIDES[0].gradient} px-8 py-12 text-white sm:py-20`}>
        <div className="max-w-lg">
          <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            {DEFAULT_SLIDES[0].title}
          </h1>
          <p className="mt-2 text-lg font-semibold text-[#F97316]">{DEFAULT_SLIDES[0].subtitle}</p>
          <p className="mt-1 text-white/70">{DEFAULT_SLIDES[0].desc}</p>
          <Link to={DEFAULT_SLIDES[0].link} className="btn-primary mt-6 inline-flex !px-8">
            {DEFAULT_SLIDES[0].btn}
          </Link>
        </div>
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 right-16 h-48 w-48 rounded-full bg-[#2563EB]/20" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative min-h-[200px] sm:min-h-[340px]"
        >
          <img src={current.image?.url} alt={current.title}
            className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[200px] items-center px-8 py-10 sm:min-h-[340px] sm:px-14">
            <div className="max-w-md text-white">
              {current.badge && (
                <span className="inline-block rounded-full bg-[#F97316] px-3 py-1 text-sm font-bold">{current.badge}</span>
              )}
              <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight sm:text-4xl">{current.title}</h1>
              {current.subtitle && <p className="mt-2 text-white/80 sm:text-lg">{current.subtitle}</p>}
              <Link to={current.link || "/products"} className="btn-primary mt-5 inline-flex">Shop Now</Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md hover:scale-110">
            <ChevronLeft size={17} />
          </button>
          <button onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md hover:scale-110">
            <ChevronRight size={17} />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;
