import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroSlider: React.FC = () => {
  const { banners, settings, setSelectedCategoryId, setIsPaintStudioOpen } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = banners.filter((b) => b.active);

  useEffect(() => {
    if (currentSlide >= slides.length && slides.length > 0) {
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  const safeIndex = currentSlide < slides.length ? currentSlide : 0;
  const current = slides[safeIndex];

  const handleActionClick = () => {
    if (current.buttonActionType === 'paint_studio') {
      setIsPaintStudioOpen(true);
    } else if (current.buttonActionType === 'category' && current.buttonTarget) {
      setSelectedCategoryId(current.buttonTarget);
    } else if (current.buttonActionType === 'whatsapp') {
      const text = `السلام عليكم، بخصوص العرض المعلن: ${current.title || settings.storeName}`;
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    } else if (current.buttonTarget) {
      setSelectedCategoryId(current.buttonTarget);
    }
  };

  return (
    <div className="relative bg-[#0d2149] text-white overflow-hidden border-b border-indigo-950/40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5 relative z-10">
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#081530]">
          <img
            key={current.id}
            src={current.image}
            alt={current.title || settings.storeName}
            onClick={handleActionClick}
            className="w-full h-auto max-h-[580px] object-contain mx-auto block cursor-pointer animate-in fade-in"
          />

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/65 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-lg backdrop-blur-xs"
                aria-label="السابق"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide((prev) => (prev + 1) % slides.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/65 hover:bg-slate-900 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 shadow-lg backdrop-blur-xs"
                aria-label="التالي"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === safeIndex ? 'w-7 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`شريحة ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
