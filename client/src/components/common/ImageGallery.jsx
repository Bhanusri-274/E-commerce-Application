import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ images = [], alt = "" }) => {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
        No image
      </div>
    );
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length);
  const next = () => setActive((a) => (a + 1) % images.length);

  return (
    <div>
      <div className="card-surface relative aspect-square overflow-hidden p-2">
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]?.url}
            alt={alt}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full rounded-xl object-cover"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md"
            >
              <ChevronRight size={17} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                active === i ? "border-[#2563EB]" : "border-transparent"
              }`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
